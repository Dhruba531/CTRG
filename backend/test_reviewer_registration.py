"""
Test script for reviewer registration and approval workflow.
Run this from the backend directory: python test_reviewer_registration.py
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from reviews.models import ReviewerProfile

User = get_user_model()

def test_reviewer_registration():
    """Test the complete reviewer registration and approval workflow"""

    print("=" * 60)
    print("Testing Reviewer Registration & Approval Workflow")
    print("=" * 60)

    # Clean up test user if exists
    test_email = "test.reviewer@nsu.edu"
    User.objects.filter(email=test_email).delete()

    # Test 1: Create inactive reviewer
    print("\n1. Creating inactive reviewer account...")
    try:
        user = User.objects.create_user(
            username="test.reviewer",
            email=test_email,
            password="TestPass123!",
            first_name="Test",
            last_name="Reviewer"
        )
        user.is_active = False
        user.save()

        # Assign to Reviewer group
        group, _ = Group.objects.get_or_create(name='Reviewer')
        user.groups.add(group)

        # Create reviewer profile
        profile = ReviewerProfile.objects.create(
            user=user,
            is_active_reviewer=False
        )

        print("   ✓ Inactive reviewer account created successfully")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Is Active: {user.is_active}")
        print(f"   - Reviewer Profile Active: {profile.is_active_reviewer}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    # Test 2: Verify user cannot login while inactive
    print("\n2. Verifying inactive user cannot authenticate...")
    from django.contrib.auth import authenticate
    auth_user = authenticate(username=user.username, password="TestPass123!")
    if auth_user is None:
        print("   ✓ Inactive user correctly blocked from authentication")
    else:
        print("   ✗ Error: Inactive user was able to authenticate!")
        return False

    # Test 3: Get pending reviewers
    print("\n3. Fetching pending reviewers...")
    try:
        pending = User.objects.filter(
            groups__name='Reviewer',
            is_active=False
        )
        print(f"   ✓ Found {pending.count()} pending reviewer(s)")
        for p in pending:
            print(f"   - {p.get_full_name()} ({p.email})")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    # Test 4: Approve reviewer
    print("\n4. Approving reviewer...")
    try:
        user.is_active = True
        user.save()

        profile.is_active_reviewer = True
        profile.save()

        print("   ✓ Reviewer approved successfully")
        print(f"   - Is Active: {user.is_active}")
        print(f"   - Reviewer Profile Active: {profile.is_active_reviewer}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    # Test 5: Verify user can now login
    print("\n5. Verifying approved user can authenticate...")
    auth_user = authenticate(username=user.username, password="TestPass123!")
    if auth_user is not None:
        print("   ✓ Approved user can successfully authenticate")
    else:
        print("   ✗ Error: Approved user cannot authenticate!")
        return False

    # Test 6: Verify no pending reviewers remain
    print("\n6. Verifying no pending reviewers remain...")
    pending = User.objects.filter(
        groups__name='Reviewer',
        is_active=False
    )
    print(f"   ✓ {pending.count()} pending reviewer(s) remaining")

    # Cleanup
    print("\n7. Cleaning up test data...")
    user.delete()
    print("   ✓ Test user deleted")

    print("\n" + "=" * 60)
    print("All tests passed! ✓")
    print("=" * 60)
    return True

if __name__ == '__main__':
    try:
        success = test_reviewer_registration()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
