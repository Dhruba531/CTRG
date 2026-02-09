"""
Management command to populate database with test data.
Usage: python manage.py populate_test_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from proposals.models import GrantCycle, Proposal
from reviews.models import ReviewAssignment, ReviewerProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with test data for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating test data...'))

        # Create Grant Cycle
        cycle, created = GrantCycle.objects.get_or_create(
            name='2026 Research Grant Cycle',
            defaults={
                'year': 2026,
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=365)).date(),
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created grant cycle: {cycle.name}'))
        else:
            self.stdout.write(f'  Grant cycle already exists: {cycle.name}')

        # Create sample proposals
        proposals_data = [
            {
                'title': 'AI-Powered Education Platform',
                'abstract': 'This research proposes an AI-driven platform to enhance personalized learning.',
                'pi_name': 'Dr. Sarah Johnson',
                'pi_email': 'sarah.johnson@nsu.edu',
                'pi_department': 'Computer Science',
                'fund_requested': 75000,
            },
            {
                'title': 'Sustainable Energy Solutions Research',
                'abstract': 'Investigation of renewable energy sources for urban environments.',
                'pi_name': 'Dr. Michael Chen',
                'pi_email': 'michael.chen@nsu.edu',
                'pi_department': 'Engineering',
                'fund_requested': 120000,
            },
            {
                'title': 'Machine Learning for Healthcare Diagnostics',
                'abstract': 'Development of ML models for early disease detection.',
                'pi_name': 'Dr. Emily Rodriguez',
                'pi_email': 'emily.rodriguez@nsu.edu',
                'pi_department': 'Biomedical Engineering',
                'fund_requested': 95000,
            },
        ]

        created_proposals = []
        for data in proposals_data:
            proposal, created = Proposal.objects.get_or_create(
                title=data['title'],
                defaults={
                    **data,
                    'cycle': cycle,
                    'status': 'SUBMITTED',
                }
            )
            if created:
                created_proposals.append(proposal)
                self.stdout.write(self.style.SUCCESS(f'✓ Created proposal: {proposal.title}'))
            else:
                self.stdout.write(f'  Proposal already exists: {proposal.title}')

        # Get reviewers
        try:
            reviewer1 = User.objects.get(email='reviewer1@nsu.edu')
            reviewer2 = User.objects.get(email='reviewer2@nsu.edu')
            reviewers = [reviewer1, reviewer2]
            self.stdout.write(f'✓ Found {len(reviewers)} reviewers')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('ERROR: Reviewers not found. Please create reviewer1@nsu.edu and reviewer2@nsu.edu first.'))
            return

        # Create review assignments
        all_proposals = Proposal.objects.filter(cycle=cycle, status='SUBMITTED')
        assignment_count = 0
        
        for proposal in all_proposals:
            for i, reviewer in enumerate(reviewers):
                assignment, created = ReviewAssignment.objects.get_or_create(
                    proposal=proposal,
                    reviewer=reviewer,
                    stage=1,
                    defaults={
                        'status': 'PENDING',
                        'deadline': timezone.now() + timedelta(days=30),
                    }
                )
                if created:
                    assignment_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Assigned {reviewer.username} to "{proposal.title}"'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Test data populated successfully!'))
        self.stdout.write(self.style.SUCCESS(f'  - Grant Cycles: 1'))
        self.stdout.write(self.style.SUCCESS(f'  - Proposals: {all_proposals.count()}'))
        self.stdout.write(self.style.SUCCESS(f'  - Review Assignments: {assignment_count}'))
        self.stdout.write(self.style.SUCCESS(f'\nNow try logging in as reviewer1@nsu.edu!'))
