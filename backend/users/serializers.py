"""
User Serializers for Authentication and User Management

This module contains serializers for user authentication, registration,
password management, and user profile handling in the CTRG Grant System.

Serializers:
    - UserSerializer: Full user profile with role information
    - LoginSerializer: Email/password validation for login
    - UserCreateSerializer: User registration with role assignment
    - ChangePasswordSerializer: Password change validation
    - UserListSerializer: Summary user information for listings
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# Get the custom User model
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Complete user profile serializer with role information.

    This serializer returns comprehensive user details including their role
    (determined by Django Group membership) for use in authentication responses
    and profile views.

    Fields:
        - id: User's unique identifier
        - username: User's username
        - email: User's email address
        - first_name: User's first name
        - last_name: User's last name
        - role: User's primary role (PI, Reviewer, or SRC_Chair)
        - is_active: Whether the user account is active

    Example:
        {
            "id": 1,
            "username": "john.doe",
            "email": "john.doe@nsu.edu",
            "first_name": "John",
            "last_name": "Doe",
            "role": "SRC_Chair",
            "is_active": true
        }
    """

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active']
        read_only_fields = ['id']

    def get_role(self, obj):
        """
        Get the user's primary role from their group membership.

        Args:
            obj (User): User instance

        Returns:
            str: Role name ('PI', 'Reviewer', 'SRC_Chair') or None if no group assigned
        """
        # Get the first group as the primary role
        group = obj.groups.first()
        return group.name if group else None


class LoginSerializer(serializers.Serializer):
    """
    Login request serializer for email/password authentication.

    Validates user credentials and returns the authenticated user instance.
    Used by the LoginView to authenticate users before issuing tokens.

    Fields:
        - email: User's email address (required)
        - password: User's password (write-only, required)

    Validation:
        - Checks if user exists with provided email
        - Validates password correctness
        - Ensures user account is active

    Raises:
        ValidationError: If credentials are invalid or account is inactive
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validate login credentials and return authenticated user.

        Args:
            attrs (dict): Dictionary with 'email' and 'password'

        Returns:
            dict: Validated data with authenticated user instance

        Raises:
            ValidationError: If credentials are invalid or account inactive
        """
        email = attrs.get('email')
        password = attrs.get('password')

        # Check if user exists with this email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'email': 'No user found with this email address.'
            })

        # Authenticate with username (since Django uses username for auth)
        user = authenticate(
            request=self.context.get('request'),
            username=user.username,  # Use username for authentication
            password=password
        )

        if not user:
            raise serializers.ValidationError({
                'password': 'Incorrect password.'
            })

        # Check if user account is active
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': 'This user account has been disabled.'
            })

        # Add authenticated user to validated data
        attrs['user'] = user
        return attrs


class UserCreateSerializer(serializers.ModelSerializer):
    """
    User registration serializer for creating new users.

    This serializer is used by SRC Chair (admin) to create new user accounts
    for PIs and Reviewers. Handles password validation, role assignment,
    and automatic group membership.

    Fields:
        - username: Unique username (required)
        - email: Unique email address (required)
        - password: Password (write-only, validated, required)
        - first_name: User's first name (required)
        - last_name: User's last name (required)
        - role: User's role - must be 'PI', 'Reviewer', or 'SRC_Chair' (required)

    Validation:
        - Password must meet Django's password validation requirements
        - Email must be unique
        - Username must be unique
        - Role must be one of the three valid roles

    Example:
        {
            "username": "jane.smith",
            "email": "jane.smith@nsu.edu",
            "password": "SecurePass123!",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "Reviewer"
        }
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=['PI', 'Reviewer', 'SRC_Chair'],
        required=True,
        write_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_email(self, value):
        """
        Ensure email is unique across all users.

        Args:
            value (str): Email address to validate

        Returns:
            str: Validated email address

        Raises:
            ValidationError: If email already exists
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """
        Create new user with hashed password and role assignment.

        Extracts the role from validated data, creates the user with a properly
        hashed password, and assigns the user to the appropriate Django group.

        Args:
            validated_data (dict): Validated user data including role

        Returns:
            User: Newly created user instance with assigned role
        """
        # Extract role from validated data (not a User model field)
        role = validated_data.pop('role')

        # Create user with hashed password
        user = User.objects.create_user(**validated_data)

        # Assign user to the specified role group
        try:
            group = Group.objects.get(name=role)
            user.groups.add(group)
        except Group.DoesNotExist:
            # If group doesn't exist, create it and assign
            group = Group.objects.create(name=role)
            user.groups.add(group)

        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Password change serializer for authenticated users.

    Allows users to change their password by providing their current password
    for verification and a new password that meets validation requirements.

    Fields:
        - old_password: Current password for verification (write-only, required)
        - new_password: New password (write-only, validated, required)

    Validation:
        - Old password must be correct
        - New password must meet Django's password validation requirements
        - New password must be different from old password

    Example:
        {
            "old_password": "OldPass123!",
            "new_password": "NewSecurePass456!"
        }
    """

    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )

    def validate_old_password(self, value):
        """
        Verify the old password is correct.

        Args:
            value (str): The old password provided by user

        Returns:
            str: Validated old password

        Raises:
            ValidationError: If old password is incorrect
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        """
        Ensure new password is different from old password.

        Args:
            attrs (dict): Dictionary with old and new passwords

        Returns:
            dict: Validated data

        Raises:
            ValidationError: If new password is same as old password
        """
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': 'New password must be different from the old password.'
            })
        return attrs

    def save(self, **kwargs):
        """
        Update user's password with the new password.

        Extracts new password, updates the user's password using Django's
        set_password method (which handles hashing), and saves the user.

        Returns:
            User: Updated user instance
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight user serializer for user listings.

    Used by admin views to display lists of users without full profile details.
    Includes essential information and role.

    Fields:
        - id: User identifier
        - username: Username
        - email: Email address
        - full_name: Combined first and last name
        - role: User's primary role
        - is_active: Account status

    Example:
        {
            "id": 1,
            "username": "john.doe",
            "email": "john.doe@nsu.edu",
            "full_name": "John Doe",
            "role": "Reviewer",
            "is_active": true
        }
    """

    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'is_active']

    def get_role(self, obj):
        """
        Get user's primary role from group membership.

        Args:
            obj (User): User instance

        Returns:
            str: Role name or None
        """
        group = obj.groups.first()
        return group.name if group else None

    def get_full_name(self, obj):
        """
        Get user's full name from first and last name.

        Args:
            obj (User): User instance

        Returns:
            str: Full name or email if name not set
        """
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.email
