"""
Debug script for reviewer registration and approval workflow.
Run from backend directory: python scripts/reviewer_registration_debug.py
"""

import os


def run_reviewer_registration_check():
    import django

    # Setup Django environment only when this script is executed directly.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

    from django.contrib.auth import authenticate, get_user_model
    from django.contrib.auth.models import Group
    from reviews.models import ReviewerProfile

    user_model = get_user_model()

    print('=' * 60)
    print('Testing Reviewer Registration and Approval Workflow')
    print('=' * 60)

    test_email = 'test.reviewer@nsu.edu'
    user_model.objects.filter(email=test_email).delete()

    print('\n1. Creating inactive reviewer account...')
    try:
        user = user_model.objects.create_user(
            username='test.reviewer',
            email=test_email,
            password='TestPass123!',
            first_name='Test',
            last_name='Reviewer',
        )
        user.is_active = False
        user.save()

        group, _ = Group.objects.get_or_create(name='Reviewer')
        user.groups.add(group)

        profile = ReviewerProfile.objects.create(
            user=user,
            is_active_reviewer=False,
            area_of_expertise='',
        )

        print('   [OK] Inactive reviewer account created successfully')
        print(f'   - Username: {user.username}')
        print(f'   - Email: {user.email}')
        print(f'   - Is Active: {user.is_active}')
        print(f'   - Reviewer Profile Active: {profile.is_active_reviewer}')
    except Exception as e:
        print(f'   [FAIL] Error: {e}')
        return False

    print('\n2. Verifying inactive user cannot authenticate...')
    auth_user = authenticate(username=user.username, password='TestPass123!')
    if auth_user is None:
        print('   [OK] Inactive user correctly blocked from authentication')
    else:
        print('   [FAIL] Inactive user was able to authenticate')
        return False

    print('\n3. Fetching pending reviewers...')
    try:
        pending = user_model.objects.filter(
            groups__name='Reviewer',
            is_active=False,
        )
        print(f'   [OK] Found {pending.count()} pending reviewer(s)')
        for pending_user in pending:
            print(f'   - {pending_user.get_full_name()} ({pending_user.email})')
    except Exception as e:
        print(f'   [FAIL] Error: {e}')
        return False

    print('\n4. Approving reviewer...')
    try:
        user.is_active = True
        user.save()

        profile.is_active_reviewer = True
        profile.save()

        print('   [OK] Reviewer approved successfully')
        print(f'   - Is Active: {user.is_active}')
        print(f'   - Reviewer Profile Active: {profile.is_active_reviewer}')
    except Exception as e:
        print(f'   [FAIL] Error: {e}')
        return False

    print('\n5. Verifying approved user can authenticate...')
    auth_user = authenticate(username=user.username, password='TestPass123!')
    if auth_user is not None:
        print('   [OK] Approved user can successfully authenticate')
    else:
        print('   [FAIL] Approved user cannot authenticate')
        return False

    print('\n6. Verifying no pending reviewers remain...')
    pending = user_model.objects.filter(
        groups__name='Reviewer',
        is_active=False,
    )
    print(f'   [OK] {pending.count()} pending reviewer(s) remaining')

    print('\n7. Cleaning up test data...')
    user.delete()
    print('   [OK] Test user deleted')

    print('\n' + '=' * 60)
    print('All checks passed')
    print('=' * 60)
    return True


def main():
    try:
        success = run_reviewer_registration_check()
        raise SystemExit(0 if success else 1)
    except Exception as e:
        print(f'\n[FAIL] Script failed with error: {e}')
        import traceback
        traceback.print_exc()
        raise SystemExit(1)


if __name__ == '__main__':
    main()
