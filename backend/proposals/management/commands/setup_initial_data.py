"""
Django Management Command: Setup Initial Data

This command initializes the CTRG Grant System database with required data:
- Creates Django Groups for user roles (PI, Reviewer, SRC_Chair)
- Creates a default admin user account
- Optionally creates sample grant cycle for testing

Usage:
    python manage.py setup_initial_data

    With options:
    python manage.py setup_initial_data --skip-admin  # Skip admin user creation
    python manage.py setup_initial_data --with-sample  # Create sample data
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import IntegrityError
from datetime import datetime, timedelta

# Get custom User model
User = get_user_model()


class Command(BaseCommand):
    """
    Management command to set up initial data for CTRG Grant System.

    This command is idempotent - it can be run multiple times safely.
    Existing data will not be duplicated.
    """

    help = 'Set up initial data for CTRG Grant System (groups, admin user)'

    def add_arguments(self, parser):
        """
        Add command-line arguments.

        Arguments:
            --skip-admin: Skip admin user creation
            --with-sample: Create sample grant cycle and data
        """
        parser.add_argument(
            '--skip-admin',
            action='store_true',
            help='Skip admin user creation',
        )
        parser.add_argument(
            '--with-sample',
            action='store_true',
            help='Create sample grant cycle and data for testing',
        )

    def handle(self, *args, **options):
        """
        Main command execution method.

        Creates groups, admin user, and optionally sample data.
        Provides detailed console output about actions taken.
        """
        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('CTRG Grant System - Initial Setup'))
        self.stdout.write(self.style.SUCCESS('========================================\n'))

        # Step 1: Create user role groups
        self._create_groups()

        # Step 2: Create admin user (unless skipped)
        if not options['skip_admin']:
            self._create_admin_user()
        else:
            self.stdout.write(self.style.WARNING('⊗ Skipped admin user creation (--skip-admin flag)'))

        # Step 3: Create sample data (if requested)
        if options['with_sample']:
            self._create_sample_data()

        # Final success message
        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('✓ Initial setup completed successfully!'))
        self.stdout.write(self.style.SUCCESS('========================================\n'))

        # Show next steps
        self._show_next_steps()

    def _create_groups(self):
        """
        Create Django Groups for user roles.

        Creates three groups:
        - PI: Principal Investigators (proposal submitters)
        - Reviewer: Proposal reviewers
        - SRC_Chair: System administrators

        Groups are used for role-based access control throughout the system.
        """
        self.stdout.write('\n1. Creating User Role Groups...')

        groups = ['PI', 'Reviewer', 'SRC_Chair']
        created_count = 0

        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✓ Created group: {group_name}')
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(f'   ⊗ Group already exists: {group_name}')
                )

        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n   Created {created_count} new group(s)')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('   All groups already exist')
            )

    def _create_admin_user(self):
        """
        Create default admin user account.

        Creates a superuser account with:
        - Username: admin
        - Email: admin@nsu.edu
        - Password: admin123 (CHANGE THIS IN PRODUCTION!)
        - Role: SRC_Chair

        The admin user can access Django admin panel and has full system privileges.

        Warning:
            This creates an account with a default password. Change the password
            immediately in production environments.
        """
        self.stdout.write('\n2. Creating Admin User...')

        # Admin user credentials (default)
        username = 'admin'
        email = 'admin@nsu.edu'
        password = 'admin123'  # IMPORTANT: Change this in production!
        first_name = 'System'
        last_name = 'Administrator'

        # Check if admin user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'   ⊗ Admin user already exists: {username}')
            )
            return

        try:
            # Create superuser account
            admin_user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Add admin to SRC_Chair group for role-based permissions
            src_chair_group = Group.objects.get(name='SRC_Chair')
            admin_user.groups.add(src_chair_group)

            self.stdout.write(
                self.style.SUCCESS(f'   ✓ Created admin user: {username}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'     Email: {email}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'     Password: {password}')
            )
            self.stdout.write(
                self.style.WARNING('\n   ⚠  IMPORTANT: Change the default password immediately!')
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error creating admin user: {str(e)}')
            )

    def _create_sample_data(self):
        """
        Create sample grant cycle and test data.

        Creates:
        - A sample grant cycle for the current year
        - Sample reviewer profiles
        - Sample proposals (optional)

        This is useful for testing and demonstration purposes.
        """
        self.stdout.write('\n3. Creating Sample Data...')

        try:
            from proposals.models import GrantCycle
            from reviews.models import ReviewerProfile

            # Create sample grant cycle
            current_year = datetime.now().year
            cycle_name = f'CTRG {current_year}-{current_year + 1}'

            cycle, created = GrantCycle.objects.get_or_create(
                name=cycle_name,
                defaults={
                    'year': current_year,
                    'start_date': datetime.now().date(),
                    'end_date': (datetime.now() + timedelta(days=180)).date(),
                    'stage1_review_start_date': datetime.now().date(),
                    'stage1_review_end_date': (datetime.now() + timedelta(days=30)).date(),
                    'revision_window_days': 7,
                    'stage2_review_start_date': (datetime.now() + timedelta(days=40)).date(),
                    'stage2_review_end_date': (datetime.now() + timedelta(days=60)).date(),
                    'acceptance_threshold': 70.0,
                    'max_reviewers_per_proposal': 2,
                    'is_active': True,
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✓ Created sample grant cycle: {cycle_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'   ⊗ Grant cycle already exists: {cycle_name}')
                )

            # Create sample reviewer users
            reviewer_group = Group.objects.get(name='Reviewer')
            sample_reviewers = [
                ('reviewer1', 'reviewer1@nsu.edu', 'Computer Science'),
                ('reviewer2', 'reviewer2@nsu.edu', 'Data Science'),
            ]

            created_reviewers = 0
            for username, email, expertise in sample_reviewers:
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password='reviewer123',  # Default password
                        first_name='Sample',
                        last_name=f'Reviewer {username[-1]}'
                    )
                    user.groups.add(reviewer_group)

                    # Create reviewer profile
                    ReviewerProfile.objects.create(
                        user=user,
                        area_of_expertise=expertise,
                        max_review_load=5,
                        is_active_reviewer=True
                    )
                    created_reviewers += 1

            if created_reviewers > 0:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✓ Created {created_reviewers} sample reviewer(s)')
                )

            # Create sample PI user
            pi_group = Group.objects.get(name='PI')
            if not User.objects.filter(username='pi_test').exists():
                pi_user = User.objects.create_user(
                    username='pi_test',
                    email='pi@nsu.edu',
                    password='pi123',  # Default password
                    first_name='Sample',
                    last_name='PI'
                )
                pi_user.groups.add(pi_group)
                self.stdout.write(
                    self.style.SUCCESS('   ✓ Created sample PI user: pi_test')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error creating sample data: {str(e)}')
            )

    def _show_next_steps(self):
        """
        Display next steps and helpful information.

        Shows:
        - Admin login credentials
        - URLs for accessing the system
        - Commands for running the application
        - Security warnings
        """
        self.stdout.write('\nNext Steps:')
        self.stdout.write('-----------')
        self.stdout.write('\n1. Start the Django development server:')
        self.stdout.write('   python manage.py runserver')
        self.stdout.write('\n2. Access the Django admin panel:')
        self.stdout.write('   http://localhost:8000/admin/')
        self.stdout.write('   Username: admin')
        self.stdout.write('   Password: admin123')
        self.stdout.write('\n3. Access the API endpoints:')
        self.stdout.write('   http://localhost:8000/api/')
        self.stdout.write('\n4. Login via frontend:')
        self.stdout.write('   Email: admin@nsu.edu')
        self.stdout.write('   Password: admin123')
        self.stdout.write('\n' + self.style.WARNING('⚠  Security Reminders:'))
        self.stdout.write(self.style.WARNING('   - Change the default admin password immediately'))
        self.stdout.write(self.style.WARNING('   - Update SECRET_KEY in .env for production'))
        self.stdout.write(self.style.WARNING('   - Configure email settings in .env'))
        self.stdout.write(self.style.WARNING('   - Set DEBUG=False in production'))
        self.stdout.write()
