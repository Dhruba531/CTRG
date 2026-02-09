from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from proposals.models import Proposal, GrantCycle
from reviews.models import ReviewAssignment, Stage1Score, Stage2Review

class Command(BaseCommand):
    help = 'Setup user roles and permissions for CTRG System'

    def handle(self, *args, **options):
        self.stdout.write('Setting up roles and permissions...')

        # defined groups
        roles = {
            'SRC_Chair': [],  # Full access usually handled by is_staff/superuser, but we can add specific ones
            'Reviewer': [
                'view_proposal', 
                'add_stage1score', 'change_stage1score',
                'add_stage2review', 'change_stage2review'
            ],
            'PI': [
                'add_proposal', 'change_proposal', 'view_proposal',
            ]
        }

        for role_name, permissions in roles.items():
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f'Created group: {role_name}')
            else:
                self.stdout.write(f'Group exists: {role_name}')

            # Assign permissions (simplified for now, logic mostly in views)
            # In a real scenario, we would map these strings to actual Permission objects
            # For now, we rely principally on Group membership checks in views
            
        self.stdout.write(self.style.SUCCESS('Successfully set up roles.'))
