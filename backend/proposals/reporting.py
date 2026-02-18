"""
Report Generation Module.
Generates PDF and Word documents for proposals and reviews.
"""
import io
import logging
from xml.sax.saxutils import escape

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Q
from django.utils import timezone


logger = logging.getLogger(__name__)


def _safe_text(value):
    """Escape dynamic values before inserting into ReportLab Paragraph markup."""
    if value is None:
        return ""
    return escape(str(value))


def generate_combined_review_pdf(proposal):
    """
    Generate a combined PDF report with all reviews for a proposal.
    
    Args:
        proposal: Proposal instance
        
    Returns:
        BytesIO buffer containing the PDF
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        # Fallback if reportlab is not installed
        buffer = io.BytesIO()
        buffer.write(b"Report generation requires reportlab. Please install it with: pip install reportlab")
        buffer.seek(0)
        return buffer
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph("Combined Review Report", title_style))
    story.append(Spacer(1, 12))
    
    # Proposal Details
    fund_requested = proposal.fund_requested
    if fund_requested is None:
        fund_requested_text = "N/A"
    else:
        fund_requested_text = f"${fund_requested:,.2f}"
    story.append(Paragraph(f"<b>Proposal Code:</b> {_safe_text(proposal.proposal_code)}", styles['Normal']))
    story.append(Paragraph(f"<b>Title:</b> {_safe_text(proposal.title)}", styles['Normal']))
    story.append(Paragraph(f"<b>PI:</b> {_safe_text(proposal.pi_name)}", styles['Normal']))
    story.append(Paragraph(f"<b>Department:</b> {_safe_text(proposal.pi_department)}", styles['Normal']))
    story.append(Paragraph(f"<b>Funding Requested:</b> {_safe_text(fund_requested_text)}", styles['Normal']))
    story.append(Paragraph(f"<b>Status:</b> {_safe_text(proposal.get_status_display())}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Stage 1 Reviews
    story.append(Paragraph("Stage 1 Reviews", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    from reviews.models import ReviewAssignment
    stage1_assignments = ReviewAssignment.objects.filter(
        proposal=proposal,
        stage=ReviewAssignment.Stage.STAGE_1,
        status=ReviewAssignment.Status.COMPLETED
    ).select_related('stage1_score')
    
    for i, assignment in enumerate(stage1_assignments, 1):
        story.append(Paragraph(f"<b>Reviewer {i}</b>", styles['Heading3']))
        
        try:
            score = assignment.stage1_score
            
            # Score table
            score_data = [
                ['Criteria', 'Score', 'Max'],
                ['Originality', str(score.originality_score), '15'],
                ['Clarity', str(score.clarity_score), '15'],
                ['Literature Review', str(score.literature_review_score), '15'],
                ['Methodology', str(score.methodology_score), '15'],
                ['Impact', str(score.impact_score), '15'],
                ['Publication Potential', str(score.publication_potential_score), '10'],
                ['Budget Appropriateness', str(score.budget_appropriateness_score), '10'],
                ['Timeline Practicality', str(score.timeline_practicality_score), '5'],
                ['Total', str(score.total_score), '100'],
                ['Percentage', f"{score.percentage_score}%", '-'],
            ]
            
            table = Table(score_data, colWidths=[2.5*inch, 1*inch, 0.75*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, -2), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 10))
            
            if score.narrative_comments:
                story.append(Paragraph(f"<b>Comments:</b>", styles['Normal']))
                story.append(Paragraph(_safe_text(score.narrative_comments), styles['Normal']))
            
        except ObjectDoesNotExist:
            story.append(Paragraph("Score data not available", styles['Normal']))
        except Exception:
            logger.exception("Unexpected error while rendering stage 1 score for assignment_id=%s", assignment.id)
            story.append(Paragraph("Score data not available", styles['Normal']))
        
        story.append(Spacer(1, 15))
    
    if not stage1_assignments.exists():
        story.append(Paragraph("No Stage 1 reviews completed yet.", styles['Normal']))
    
    # Stage 2 Reviews if applicable
    story.append(Spacer(1, 20))
    story.append(Paragraph("Stage 2 Reviews", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    stage2_assignments = ReviewAssignment.objects.filter(
        proposal=proposal,
        stage=ReviewAssignment.Stage.STAGE_2,
        status=ReviewAssignment.Status.COMPLETED
    ).select_related('stage2_review')
    
    for i, assignment in enumerate(stage2_assignments, 1):
        story.append(Paragraph(f"<b>Reviewer {i}</b>", styles['Heading3']))
        
        try:
            review = assignment.stage2_review
            story.append(Paragraph(f"<b>Concerns Addressed:</b> {_safe_text(review.get_concerns_addressed_display())}", styles['Normal']))
            story.append(Paragraph(f"<b>Recommendation:</b> {_safe_text(review.get_revised_recommendation_display())}", styles['Normal']))
            if review.revised_score is not None:
                story.append(Paragraph(f"<b>Revised Score:</b> {_safe_text(review.revised_score)}%", styles['Normal']))
            if review.technical_comments:
                story.append(Paragraph(f"<b>Technical Comments:</b>", styles['Normal']))
                story.append(Paragraph(_safe_text(review.technical_comments), styles['Normal']))
            if review.budget_comments:
                story.append(Paragraph(f"<b>Budget Comments:</b>", styles['Normal']))
                story.append(Paragraph(_safe_text(review.budget_comments), styles['Normal']))
        except ObjectDoesNotExist:
            story.append(Paragraph("Review data not available", styles['Normal']))
        except Exception:
            logger.exception("Unexpected error while rendering stage 2 review for assignment_id=%s", assignment.id)
            story.append(Paragraph("Review data not available", styles['Normal']))
        
        story.append(Spacer(1, 15))
    
    if not stage2_assignments.exists():
        story.append(Paragraph("No Stage 2 reviews completed yet.", styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        f"Generated on {timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')}",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_summary_report(cycle):
    """
    Generate a summary report for a grant cycle.
    
    Args:
        cycle: GrantCycle instance
        
    Returns:
        BytesIO buffer containing the PDF
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        buffer = io.BytesIO()
        buffer.write(b"Report generation requires reportlab.")
        buffer.seek(0)
        return buffer
    
    from proposals.models import Proposal
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    story.append(Paragraph("CTRG Grant Cycle Summary Report", styles['Heading1']))
    story.append(Paragraph(f"{_safe_text(cycle.name)} ({_safe_text(cycle.year)})", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    proposals = cycle.proposals.all()
    total_count = proposals.count()

    # Status counts
    submitted_count = proposals.filter(status=Proposal.Status.SUBMITTED).count()
    under_s1_count = proposals.filter(status=Proposal.Status.UNDER_STAGE_1_REVIEW).count()
    s1_rejected_count = proposals.filter(status=Proposal.Status.STAGE_1_REJECTED).count()
    accepted_no_corr_count = proposals.filter(status=Proposal.Status.ACCEPTED_NO_CORRECTIONS).count()
    tentatively_count = proposals.filter(status=Proposal.Status.TENTATIVELY_ACCEPTED).count()
    revision_req_count = proposals.filter(status=Proposal.Status.REVISION_REQUESTED).count()
    revised_count = proposals.filter(status=Proposal.Status.REVISED_PROPOSAL_SUBMITTED).count()
    under_s2_count = proposals.filter(status=Proposal.Status.UNDER_STAGE_2_REVIEW).count()
    final_accepted_count = proposals.filter(status=Proposal.Status.FINAL_ACCEPTED).count()
    final_rejected_count = proposals.filter(status=Proposal.Status.FINAL_REJECTED).count()

    # Acceptance rates
    s1_decided = s1_rejected_count + accepted_no_corr_count + tentatively_count + final_accepted_count + final_rejected_count
    s1_accepted = accepted_no_corr_count + tentatively_count + final_accepted_count
    s1_rate = f"{(s1_accepted / s1_decided * 100):.1f}%" if s1_decided > 0 else "N/A"

    final_decided = final_accepted_count + final_rejected_count
    final_rate = f"{(final_accepted_count / final_decided * 100):.1f}%" if final_decided > 0 else "N/A"

    # Statistics table
    stats = [
        ['Status', 'Count'],
        ['Total Proposals', str(total_count)],
        ['Submitted', str(submitted_count)],
        ['Under Stage 1 Review', str(under_s1_count)],
        ['Stage 1 Rejected', str(s1_rejected_count)],
        ['Accepted (No Corrections)', str(accepted_no_corr_count)],
        ['Tentatively Accepted', str(tentatively_count)],
        ['Final Accepted', str(final_accepted_count)],
        ['Final Rejected', str(final_rejected_count)],
    ]

    table = Table(stats, colWidths=[3*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    story.append(Spacer(1, 15))

    # Acceptance Rates
    story.append(Paragraph("Acceptance Rates", styles['Heading2']))
    story.append(Spacer(1, 8))

    rates_data = [
        ['Metric', 'Value'],
        ['Stage 1 Acceptance Rate', s1_rate],
        ['Final Acceptance Rate', final_rate],
    ]
    rates_table = Table(rates_data, colWidths=[3*inch, 1.5*inch])
    rates_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(rates_table)
    story.append(Spacer(1, 20))

    # Reviewer Workload Breakdown
    story.append(Paragraph("Reviewer Workload Summary", styles['Heading2']))
    story.append(Spacer(1, 8))

    from reviews.models import ReviewAssignment, ReviewerProfile

    reviewer_profiles = ReviewerProfile.objects.select_related('user').filter(
        user__review_assignments__proposal__cycle=cycle
    ).annotate(
        s1_count=Count('user__review_assignments', filter=Q(
            user__review_assignments__stage=ReviewAssignment.Stage.STAGE_1,
            user__review_assignments__proposal__cycle=cycle,
        )),
        s2_count=Count('user__review_assignments', filter=Q(
            user__review_assignments__stage=ReviewAssignment.Stage.STAGE_2,
            user__review_assignments__proposal__cycle=cycle,
        )),
        total=Count('user__review_assignments', filter=Q(
            user__review_assignments__proposal__cycle=cycle,
        )),
        pending=Count('user__review_assignments', filter=Q(
            user__review_assignments__status=ReviewAssignment.Status.PENDING,
            user__review_assignments__proposal__cycle=cycle,
        )),
    ).distinct()

    workload_data = [['Reviewer', 'Department', 'Stage 1', 'Stage 2', 'Total', 'Pending']]

    for profile in reviewer_profiles:
        if profile.total > 0:
            reviewer_name = profile.user.get_full_name() or profile.user.username
            workload_data.append([
                _safe_text(reviewer_name),
                _safe_text(profile.department),
                str(profile.s1_count),
                str(profile.s2_count),
                str(profile.total),
                str(profile.pending),
            ])

    if len(workload_data) > 1:
        workload_table = Table(workload_data, colWidths=[1.8*inch, 1.2*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.7*inch])
        workload_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(workload_table)
    else:
        story.append(Paragraph("No reviewer assignments for this cycle.", styles['Normal']))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Generated on {timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')}",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
