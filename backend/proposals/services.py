"""
Business Logic Services for Proposals Module.
Handles proposal lifecycle, status transitions, and notifications.
"""
import logging
from django.utils import timezone

from decimal import Decimal
from datetime import timedelta
from .models import Proposal, Stage1Decision, FinalDecision, AuditLog

logger = logging.getLogger(__name__)


class ProposalService:
    """Manages proposal lifecycle and status transitions."""
    
    @staticmethod
    def generate_proposal_code(cycle):
        """Generate unique proposal code like CTRG-2025-001."""
        from .models import Proposal
        cycle_year = str(cycle.year).split('-')[0] if cycle and cycle.year else str(timezone.now().year)
        count = Proposal.objects.filter(proposal_code__startswith=f"CTRG-{cycle_year}-").count() + 1
        proposal_code = f"CTRG-{cycle_year}-{count:03d}"
        while Proposal.objects.filter(proposal_code=proposal_code).exists():
            count += 1
            proposal_code = f"CTRG-{cycle_year}-{count:03d}"
        return proposal_code
    
    @staticmethod
    def submit_proposal(proposal):
        """Submit a draft proposal for review."""
        if proposal.status != Proposal.Status.DRAFT:
            raise ValueError("Only draft proposals can be submitted")
        
        proposal.status = Proposal.Status.SUBMITTED
        proposal.submitted_at = timezone.now()
        proposal.save()
        
        AuditLog.objects.create(
            user=None,  # PI relationship removed - audit without specific user
            action_type='PROPOSAL_SUBMITTED',
            proposal=proposal,
            details={'proposal_code': proposal.proposal_code, 'pi_email': proposal.pi_email}
        )
        return proposal
    
    @staticmethod
    def check_stage1_completion(proposal):
        """
        Check if all Stage 1 reviews are completed.
        Returns the average score if complete, None otherwise.
        """
        from reviews.models import ReviewAssignment, Stage1Score
        
        assignments = ReviewAssignment.objects.filter(
            proposal=proposal, 
            stage=ReviewAssignment.Stage.STAGE_1
        )
        if not assignments.exists():
            return None
            
        if all(a.status == ReviewAssignment.Status.COMPLETED for a in assignments):
            # Calculate average score
            scores = []
            for assignment in assignments:
                try:
                    score = assignment.stage1_score
                    scores.append(score.total_score)
                except Stage1Score.DoesNotExist:
                    return None
            
            if scores:
                avg_score = sum(scores) / len(scores)
                return Decimal(str(avg_score))
        return None
    
    @staticmethod
    def apply_stage1_decision(proposal, decision, chair_comments='', user=None):
        """
        Apply SRC Chair's Stage 1 decision.
        
        Args:
            proposal: Proposal instance
            decision: Stage1Decision.Decision choice
            chair_comments: Optional comments from chair
            user: User making the decision (for audit)
        """
        from reviews.models import ReviewAssignment
        
        # Calculate average score
        avg_score = ProposalService.check_stage1_completion(proposal)
        if avg_score is None:
            raise ValueError("Not all Stage 1 reviews are complete")

        # Warn if score below acceptance threshold (informational, chair can override)
        threshold = proposal.cycle.acceptance_threshold
        if decision != Stage1Decision.Decision.REJECT and avg_score < threshold:
            # Allow but log the override
            pass  # Chair can accept below threshold at their discretion

        # Create decision record
        stage1_decision = Stage1Decision.objects.create(
            proposal=proposal,
            decision=decision,
            chair_comments=chair_comments,
            average_score=avg_score
        )
        
        # Update proposal status based on decision
        should_save_proposal = True
        if decision == Stage1Decision.Decision.REJECT:
            proposal.status = Proposal.Status.STAGE_1_REJECTED
        elif decision == Stage1Decision.Decision.ACCEPT:
            proposal.status = Proposal.Status.ACCEPTED_NO_CORRECTIONS
        elif decision == Stage1Decision.Decision.TENTATIVELY_ACCEPT:
            # Reflect Tentative Acceptance then immediately open revision window
            proposal.status = Proposal.Status.TENTATIVELY_ACCEPTED
            proposal.save(update_fields=['status'])
            ProposalService.start_revision_window(proposal)
            should_save_proposal = False
        
        if should_save_proposal:
            proposal.save()
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action_type='STAGE1_DECISION_MADE',
            proposal=proposal,
            details={
                'decision': decision,
                'average_score': float(avg_score),
                'chair_comments': chair_comments
            }
        )
        
        return stage1_decision
    
    @staticmethod
    def start_revision_window(proposal, days=None):
        """Start the revision window for a tentatively accepted proposal."""
        if days is None:
            days = proposal.cycle.revision_window_days
        
        proposal.status = Proposal.Status.REVISION_REQUESTED
        proposal.revision_deadline = timezone.now() + timedelta(days=days)
        proposal.save()

        # Notify PI that revision is required.
        EmailService.send_revision_request_email(proposal)
        return proposal
    
    @staticmethod
    def submit_revision(proposal, revised_file=None, response_file=None, user=None):
        """Submit revised proposal after Stage 1 tentative acceptance."""
        if proposal.status != Proposal.Status.REVISION_REQUESTED:
            raise ValueError("Proposal is not awaiting revision")
        
        if proposal.is_revision_overdue:
            proposal.status = Proposal.Status.REVISION_DEADLINE_MISSED
            proposal.save()
            raise ValueError("Revision deadline has passed")
        
        if revised_file:
            proposal.revised_proposal_file = revised_file
        if response_file:
            proposal.response_to_reviewers_file = response_file
        
        proposal.status = Proposal.Status.REVISED_PROPOSAL_SUBMITTED
        proposal.save()
        
        AuditLog.objects.create(
            user=user,
            action_type='REVISION_SUBMITTED',
            proposal=proposal,
            details={'submitted_at': str(timezone.now())}
        )
        
        return proposal
    
    @staticmethod
    def start_stage2_review(proposal, user=None):
        """Transition proposal to Stage 2 review."""
        if proposal.status != Proposal.Status.REVISED_PROPOSAL_SUBMITTED:
            raise ValueError("Revised proposal not submitted")
        
        proposal.status = Proposal.Status.UNDER_STAGE_2_REVIEW
        proposal.save()
        
        AuditLog.objects.create(
            user=user,
            action_type='STAGE2_REVIEW_STARTED',
            proposal=proposal
        )
        
        return proposal
    
    @staticmethod
    def check_stage2_completion(proposal):
        """Check if all Stage 2 reviews are completed."""
        from reviews.models import ReviewAssignment
        
        assignments = ReviewAssignment.objects.filter(
            proposal=proposal,
            stage=ReviewAssignment.Stage.STAGE_2
        )
        if not assignments.exists():
            return False

        return all(a.status == ReviewAssignment.Status.COMPLETED for a in assignments)
    
    @staticmethod
    def apply_final_decision(proposal, decision, approved_amount, final_remarks, user=None):
        """
        Apply final decision after Stage 2 review.
        """
        allowed_statuses = {
            Proposal.Status.UNDER_STAGE_2_REVIEW,
            Proposal.Status.REVISED_PROPOSAL_SUBMITTED,
        }
        if proposal.status not in allowed_statuses:
            raise ValueError("Final decision can only be applied after Stage 2 workflow starts")
        if hasattr(proposal, 'final_decision'):
            raise ValueError("Final decision already exists for this proposal")

        # If Stage 2 assignments exist, ensure they are complete before final decision.
        from reviews.models import ReviewAssignment
        stage2_assignments = ReviewAssignment.objects.filter(
            proposal=proposal,
            stage=ReviewAssignment.Stage.STAGE_2
        )
        if stage2_assignments.exists() and not ProposalService.check_stage2_completion(proposal):
            raise ValueError("Not all Stage 2 reviews are complete")

        # Create final decision record
        final_decision = FinalDecision.objects.create(
            proposal=proposal,
            decision=decision,
            approved_grant_amount=approved_amount,
            final_remarks=final_remarks
        )
        
        # Update proposal status and lock
        if decision == FinalDecision.Decision.ACCEPTED:
            proposal.status = Proposal.Status.FINAL_ACCEPTED
        else:
            proposal.status = Proposal.Status.FINAL_REJECTED

        proposal.is_locked = True
        proposal.save()
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action_type='FINAL_DECISION_MADE',
            proposal=proposal,
            details={
                'decision': decision,
                'approved_amount': float(approved_amount),
                'final_remarks': final_remarks
            }
        )
        
        return final_decision
    
    @staticmethod
    def check_revision_deadline(proposal):
        """Check and update status if revision deadline passed."""
        if proposal.status == Proposal.Status.REVISION_REQUESTED:
            if proposal.revision_deadline and timezone.now() > proposal.revision_deadline:
                proposal.status = Proposal.Status.REVISION_DEADLINE_MISSED
                proposal.save()
                
                AuditLog.objects.create(
                    action_type='REVISION_DEADLINE_MISSED',
                    proposal=proposal,
                    details={'deadline': str(proposal.revision_deadline)}
                )
                return True
        return False


class ReviewerService:
    """Manages reviewer assignments and workload."""
    
    @staticmethod
    def validate_assignment(proposal, reviewer, stage=1):
        """
        Validate if a reviewer can be assigned to a proposal.
        Returns (is_valid, error_message)
        """
        from reviews.models import ReviewAssignment, ReviewerProfile
        
        # Check for duplicate assignment
        existing = ReviewAssignment.objects.filter(
            proposal=proposal,
            reviewer=reviewer,
            stage=stage
        ).exists()
        
        if existing:
            return False, "Reviewer is already assigned to this proposal for this stage"
        
        # Check reviewer profile and workload
        try:
            profile = reviewer.reviewer_profile
            if not profile.is_active_reviewer:
                return False, "Reviewer is not active"
            
            if not profile.can_accept_review():
                return False, f"Reviewer has reached maximum workload ({profile.max_review_load})"
        except ReviewerProfile.DoesNotExist:
            return False, "User does not have a reviewer profile"
        
        # Check max reviewers per proposal
        current_count = ReviewAssignment.objects.filter(
            proposal=proposal,
            stage=stage
        ).count()
        
        if current_count >= proposal.cycle.max_reviewers_per_proposal:
            return False, f"Maximum reviewers ({proposal.cycle.max_reviewers_per_proposal}) already assigned"
        
        return True, None
    
    @staticmethod
    def assign_reviewer(proposal, reviewer, stage, deadline, user=None):
        """
        Assign a reviewer to a proposal.
        """
        from reviews.models import ReviewAssignment
        
        # Validate
        is_valid, error = ReviewerService.validate_assignment(proposal, reviewer, stage)
        if not is_valid:
            raise ValueError(error)
        
        # Create assignment
        assignment = ReviewAssignment.objects.create(
            proposal=proposal,
            reviewer=reviewer,
            stage=stage,
            deadline=deadline
        )
        
        # Update proposal status if first assignment
        if proposal.status == Proposal.Status.SUBMITTED and stage == 1:
            proposal.status = Proposal.Status.UNDER_STAGE_1_REVIEW
            proposal.save()
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action_type='REVIEWER_ASSIGNED',
            proposal=proposal,
            details={
                'reviewer_id': reviewer.id,
                'reviewer_email': reviewer.email,
                'stage': stage,
                'deadline': str(deadline)
            }
        )
        
        return assignment
    
    @staticmethod
    def get_reviewer_workload(reviewer):
        """Get reviewer's current workload statistics."""
        from reviews.models import ReviewAssignment
        
        assignments = ReviewAssignment.objects.filter(reviewer=reviewer)
        
        return {
            'total': assignments.count(),
            'pending': assignments.filter(status=ReviewAssignment.Status.PENDING).count(),
            'completed': assignments.filter(status=ReviewAssignment.Status.COMPLETED).count(),
            'stage1_pending': assignments.filter(
                status=ReviewAssignment.Status.PENDING,
                stage=ReviewAssignment.Stage.STAGE_1
            ).count(),
            'stage2_pending': assignments.filter(
                status=ReviewAssignment.Status.PENDING,
                stage=ReviewAssignment.Stage.STAGE_2
            ).count(),
        }
    
    @staticmethod
    def get_all_reviewers_stats():
        """Get workload statistics for all reviewers."""
        from reviews.models import ReviewerProfile
        from django.contrib.auth import get_user_model

        User = get_user_model()
        stats = []

        profiles = ReviewerProfile.objects.select_related('user').all()
        for profile in profiles:
            workload = ReviewerService.get_reviewer_workload(profile.user)
            current_workload = workload['pending']
            stats.append({
                'id': profile.id,
                'user': profile.user.id,
                'user_email': profile.user.email,
                'user_name': profile.user.get_full_name() or profile.user.username,
                'is_active_reviewer': profile.is_active_reviewer,
                'max_review_load': profile.max_review_load,
                'area_of_expertise': profile.area_of_expertise,
                'current_workload': current_workload,
                'can_accept_more': profile.can_accept_review(),
                **workload
            })

        return stats


class EmailService:
    """Handles email notifications for the grant system."""

    @staticmethod
    def _get_from_email():
        from django.conf import settings
        return settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@nsu.edu'

    @staticmethod
    def _send_email(subject, message, recipient_list):
        from django.core.mail import send_mail

        if not recipient_list:
            logger.warning("Email not sent: empty recipient list for subject '%s'", subject)
            return False

        try:
            sent_count = send_mail(
                subject=subject,
                message=message,
                from_email=EmailService._get_from_email(),
                recipient_list=recipient_list,
                fail_silently=False
            )
            return sent_count > 0
        except Exception:
            logger.exception("Email send failed for subject '%s'", subject)
            return False
    
    @staticmethod
    def send_reviewer_assignment_email(assignment):
        """Send email to reviewer about new assignment."""
        subject = f"New Review Assignment: {assignment.proposal.proposal_code}"
        message = f"""
Dear {assignment.reviewer.get_full_name() or assignment.reviewer.username},

You have been assigned to review a grant proposal.

Proposal: {assignment.proposal.title}
Code: {assignment.proposal.proposal_code}
Stage: {assignment.get_stage_display()}
Deadline: {assignment.deadline.strftime('%Y-%m-%d %H:%M')}

Please log in to the system to complete your review.

Best regards,
CTRG Grant Review System
        """

        sent = EmailService._send_email(
            subject=subject,
            message=message,
            recipient_list=[assignment.reviewer.email]
        )
        if sent:
            assignment.notification_sent = True
            assignment.save(update_fields=['notification_sent'])
            return True
        return False
    
    @staticmethod
    def send_revision_request_email(proposal):
        """Send email to PI about revision request."""
        subject = f"Revision Requested: {proposal.proposal_code}"
        message = f"""
Dear {proposal.pi_name},

Your proposal "{proposal.title}" has been tentatively accepted pending revisions.

Proposal Code: {proposal.proposal_code}
Revision Deadline: {proposal.revision_deadline.strftime('%Y-%m-%d %H:%M') if proposal.revision_deadline else 'N/A'}

Please log in to the system to view reviewer comments and submit your revised proposal.

Best regards,
CTRG Grant Review System
        """

        return EmailService._send_email(
            subject=subject,
            message=message,
            recipient_list=[proposal.pi_email]
        )
    
    @staticmethod
    def send_final_decision_email(proposal):
        """Send email to PI about final decision."""
        decision_text = "ACCEPTED" if proposal.status == Proposal.Status.FINAL_ACCEPTED else "NOT ACCEPTED"
        
        subject = f"Final Decision: {proposal.proposal_code} - {decision_text}"
        message = f"""
Dear {proposal.pi_name},

The final decision for your proposal has been made.

Proposal: {proposal.title}
Code: {proposal.proposal_code}
Decision: {decision_text}

Please log in to the system for more details.

Best regards,
CTRG Grant Review System
        """

        return EmailService._send_email(
            subject=subject,
            message=message,
            recipient_list=[proposal.pi_email]
        )
    
    @staticmethod
    def send_bulk_email(recipients, subject, message):
        """Send email to multiple recipients."""
        from django.core.mail import send_mass_mail
        from_email = EmailService._get_from_email()
        
        messages = [
            (subject, message, from_email, [recipient.email])
            for recipient in recipients
        ]

        try:
            sent_count = send_mass_mail(messages, fail_silently=False)
            return sent_count > 0
        except Exception:
            logger.exception("Bulk email send failed for subject '%s'", subject)
            return False
