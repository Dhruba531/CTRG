from django.contrib.auth import get_user_model
from django.test import TestCase

from reviews.models import ReviewerProfile
from users.serializers import LoginSerializer, ReviewerRegistrationSerializer, UserCreateSerializer


User = get_user_model()


class ReviewerRegistrationSerializerTests(TestCase):
    def test_create_reviewer_is_inactive_and_has_profile(self):
        serializer = ReviewerRegistrationSerializer(data={
            'username': 'new.reviewer',
            'email': 'new.reviewer@nsu.edu',
            'password': 'StrongPass123!',
            'first_name': 'New',
            'last_name': 'Reviewer',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        user.refresh_from_db()

        self.assertFalse(user.is_active)
        self.assertTrue(user.groups.filter(name='Reviewer').exists())

        profile = ReviewerProfile.objects.get(user=user)
        self.assertEqual(profile.area_of_expertise, '')
        self.assertFalse(profile.is_active_reviewer)


class LoginSerializerTests(TestCase):
    def test_inactive_user_returns_disabled_error(self):
        User.objects.create_user(
            username='inactive.reviewer',
            email='inactive.reviewer@nsu.edu',
            password='StrongPass123!',
            is_active=False,
        )

        serializer = LoginSerializer(
            data={'email': 'inactive.reviewer@nsu.edu', 'password': 'StrongPass123!'},
            context={'request': None},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class UserCreateSerializerTests(TestCase):
    def test_create_reviewer_assigns_group_and_profile(self):
        serializer = UserCreateSerializer(data={
            'username': 'chair.created.reviewer',
            'email': 'chair.created.reviewer@nsu.edu',
            'password': 'StrongPass123!',
            'first_name': 'Chair',
            'last_name': 'Created',
            'role': 'Reviewer',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(user.groups.filter(name='Reviewer').exists())
        self.assertTrue(ReviewerProfile.objects.filter(user=user).exists())
