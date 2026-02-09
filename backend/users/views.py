"""
User Authentication Views for CTRG Grant System

This module provides REST API endpoints for user authentication, registration,
and user management. It implements token-based authentication using Django
REST Framework's built-in token authentication.

Views:
    - LoginView: User login with email/password
    - LogoutView: User logout (token destruction)
    - CurrentUserView: Get authenticated user's profile
    - UserRegistrationView: Create new users (admin only)
    - ChangePasswordView: Change user password
    - UserListView: List all users (admin only)

Authentication Method: Token-based (DRF AuthToken)
"""

from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    LoginSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
    UserListSerializer,
    ReviewerRegistrationSerializer
)

# Get the custom User model
User = get_user_model()


class LoginView(ObtainAuthToken):
    """
    User login endpoint that returns authentication token and user details.

    POST /api/auth/login/

    Accepts email and password, validates credentials, and returns:
    - Authentication token (for subsequent API requests)
    - User role (PI, Reviewer, or SRC_Chair)
    - Complete user profile

    Request Body:
        {
            "email": "user@nsu.edu",
            "password": "password123"
        }

    Success Response (200 OK):
        {
            "access": "a1b2c3d4e5f6...",  # Auth token
            "role": "SRC_Chair",
            "user": {
                "id": 1,
                "username": "john.doe",
                "email": "user@nsu.edu",
                "first_name": "John",
                "last_name": "Doe",
                "is_active": true
            }
        }

    Error Responses:
        - 400 Bad Request: Invalid email format or missing fields
        - 401 Unauthorized: Invalid credentials or inactive account

    Authentication: Not required (public endpoint)
    """

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Authenticate user and return token with user details.

        Args:
            request: HTTP request with email and password

        Returns:
            Response: Authentication token, role, and user profile
        """
        # Validate credentials using LoginSerializer
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Get authenticated user from serializer validation
        user = serializer.validated_data['user']

        # Get or create authentication token for this user
        token, created = Token.objects.get_or_create(user=user)

        # Determine user's role from group membership
        role = None
        if user.groups.exists():
            role = user.groups.first().name

        # Serialize user data for response
        user_serializer = UserSerializer(user)

        # Return token, role, and user details
        return Response({
            'access': token.key,  # Named 'access' for frontend compatibility
            'role': role,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    User logout endpoint that destroys the authentication token.

    POST /api/auth/logout/

    Deletes the user's authentication token, effectively logging them out.
    After logout, the token cannot be used for API authentication.

    Request Body: Empty (authentication via token in header)

    Success Response (200 OK):
        {
            "message": "Successfully logged out."
        }

    Error Responses:
        - 401 Unauthorized: No valid token provided

    Authentication: Required (Token)
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Delete user's authentication token.

        Args:
            request: HTTP request with authentication token

        Returns:
            Response: Success message
        """
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            # Handle edge case where token doesn't exist
            return Response(
                {'error': 'Logout failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    """
    Get current authenticated user's profile information.

    GET /api/auth/user/

    Returns complete profile information for the currently authenticated user.
    Used by frontend to fetch user details after login or on page reload.

    Success Response (200 OK):
        {
            "id": 1,
            "username": "john.doe",
            "email": "john.doe@nsu.edu",
            "first_name": "John",
            "last_name": "Doe",
            "role": "SRC_Chair",
            "is_active": true
        }

    Error Responses:
        - 401 Unauthorized: No valid token provided

    Authentication: Required (Token)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Return current user's profile data.

        Args:
            request: HTTP request with authentication token

        Returns:
            Response: User profile data
        """
        # Serialize authenticated user's data
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserRegistrationView(generics.CreateAPIView):
    """
    Create new user account (Admin only).

    POST /api/auth/register/

    Allows SRC Chair (admin) to create new user accounts for PIs, Reviewers,
    or other SRC Chairs. Handles password hashing and role assignment.

    Request Body:
        {
            "username": "jane.smith",
            "email": "jane.smith@nsu.edu",
            "password": "SecurePass123!",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "Reviewer"  // Must be: PI, Reviewer, or SRC_Chair
        }

    Success Response (201 Created):
        {
            "id": 5,
            "username": "jane.smith",
            "email": "jane.smith@nsu.edu",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "Reviewer",
            "is_active": true
        }

    Error Responses:
        - 400 Bad Request: Invalid data, duplicate email/username, weak password
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    serializer_class = UserCreateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def perform_create(self, serializer):
        """
        Create user and log the creation action.

        Args:
            serializer: Validated UserCreateSerializer
        """
        # Save the new user (serializer handles password hashing and role assignment)
        user = serializer.save()

        # Log user creation for audit trail
        # Note: Could extend this to log to AuditLog model if needed


class ChangePasswordView(APIView):
    """
    Change user password.

    POST /api/auth/change-password/

    Allows authenticated users to change their password by providing their
    current password for verification and a new password.

    Request Body:
        {
            "old_password": "OldPass123!",
            "new_password": "NewSecurePass456!"
        }

    Success Response (200 OK):
        {
            "message": "Password successfully changed."
        }

    Error Responses:
        - 400 Bad Request: Invalid old password, weak new password, or same password
        - 401 Unauthorized: Not authenticated

    Authentication: Required (Token)

    Note: After password change, the auth token remains valid. Consider
    invalidating the token in production to force re-login.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Validate and update user's password.

        Args:
            request: HTTP request with old and new passwords

        Returns:
            Response: Success message or validation errors
        """
        # Validate password change request
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Save new password (serializer handles hashing)
        serializer.save()

        return Response(
            {'message': 'Password successfully changed.'},
            status=status.HTTP_200_OK
        )


class UserListView(generics.ListAPIView):
    """
    List all users in the system (Admin only).

    GET /api/auth/users/

    Returns a list of all user accounts with basic information.
    Used by admin dashboard to view and manage users.

    Query Parameters:
        - role: Filter by role (optional) - e.g., ?role=Reviewer
        - is_active: Filter by active status (optional) - e.g., ?is_active=true

    Success Response (200 OK):
        [
            {
                "id": 1,
                "username": "john.doe",
                "email": "john.doe@nsu.edu",
                "full_name": "John Doe",
                "role": "SRC_Chair",
                "is_active": true
            },
            {
                "id": 2,
                "username": "jane.smith",
                "email": "jane.smith@nsu.edu",
                "full_name": "Jane Smith",
                "role": "Reviewer",
                "is_active": true
            }
        ]

    Error Responses:
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')

    def get_queryset(self):
        """
        Get filtered user queryset based on query parameters.

        Supports filtering by:
        - role: User's group/role name
        - is_active: Active status

        Returns:
            QuerySet: Filtered user queryset
        """
        queryset = super().get_queryset()

        # Filter by role if provided
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(groups__name=role)

        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        return queryset


# Additional view for user detail/update/delete (optional enhancement)
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific user (Admin only).

    GET    /api/auth/users/<id>/  - Get user details
    PUT    /api/auth/users/<id>/  - Update user
    PATCH  /api/auth/users/<id>/  - Partial update user
    DELETE /api/auth/users/<id>/  - Delete user (soft delete recommended)

    Success Response (200 OK for GET/PUT/PATCH, 204 No Content for DELETE)

    Error Responses:
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user
        - 404 Not Found: User does not exist

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'pk'


class ReviewerPublicRegistrationView(generics.CreateAPIView):
    """
    Public reviewer self-registration endpoint.

    POST /api/auth/register-reviewer/

    Allows reviewers to register themselves without admin approval.
    Automatically assigns the 'Reviewer' role to the registered user.

    Request Body:
        {
            "username": "jane.reviewer",
            "email": "jane.reviewer@nsu.edu",
            "password": "SecurePass123!",
            "first_name": "Jane",
            "last_name": "Reviewer"
        }

    Success Response (201 Created):
        {
            "id": 5,
            "username": "jane.reviewer",
            "email": "jane.reviewer@nsu.edu",
            "first_name": "Jane",
            "last_name": "Reviewer",
            "role": "Reviewer",
            "is_active": true
        }

    Error Responses:
        - 400 Bad Request: Invalid data, duplicate email/username, weak password

    Authentication: Not required (public endpoint)
    """

    serializer_class = ReviewerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        """
        Create reviewer user and log the registration action.

        Args:
            serializer: Validated ReviewerRegistrationSerializer
        """
        user = serializer.save()


class PendingReviewersView(generics.ListAPIView):
    """
    List all pending (inactive) reviewer registrations (Admin only).

    GET /api/auth/pending-reviewers/

    Returns a list of all pending reviewer accounts awaiting SRC Chair approval.
    Used by admin dashboard to review and approve new reviewer registrations.

    Success Response (200 OK):
        [
            {
                "id": 1,
                "username": "john.reviewer",
                "email": "john.reviewer@nsu.edu",
                "full_name": "John Reviewer",
                "role": "Reviewer",
                "is_active": false,
                "date_joined": "2024-02-09T10:00:00Z"
            }
        ]

    Error Responses:
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """
        Get all pending (inactive) reviewers.

        Returns:
            QuerySet: Inactive users in the Reviewer group
        """
        return User.objects.filter(
            groups__name='Reviewer',
            is_active=False
        ).order_by('-date_joined')


class ApproveReviewerView(APIView):
    """
    Approve a pending reviewer registration (Admin only).

    POST /api/auth/approve-reviewer/<id>/

    Activates a pending reviewer account, allowing them to login.

    Success Response (200 OK):
        {
            "message": "Reviewer approved successfully.",
            "user": {
                "id": 1,
                "username": "john.reviewer",
                "email": "john.reviewer@nsu.edu",
                "is_active": true
            }
        }

    Error Responses:
        - 400 Bad Request: User is already active
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user
        - 404 Not Found: User does not exist

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request, pk):
        """
        Approve pending reviewer and activate their account.

        Args:
            request: HTTP request
            pk: User ID

        Returns:
            Response: Success message and user data
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is in Reviewer group
        if not user.groups.filter(name='Reviewer').exists():
            return Response(
                {'error': 'User is not a reviewer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already active
        if user.is_active:
            return Response(
                {'error': 'Reviewer is already approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activate user account
        user.is_active = True
        user.save()

        # Activate reviewer profile
        try:
            from reviews.models import ReviewerProfile
            reviewer_profile = ReviewerProfile.objects.get(user=user)
            reviewer_profile.is_active_reviewer = True
            reviewer_profile.save()
        except:
            pass  # Profile might not exist

        serializer = UserSerializer(user)
        return Response({
            'message': 'Reviewer approved successfully.',
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class RejectReviewerView(APIView):
    """
    Reject a pending reviewer registration (Admin only).

    DELETE /api/auth/reject-reviewer/<id>/

    Deletes a pending reviewer account, rejecting their registration.

    Success Response (200 OK):
        {
            "message": "Reviewer registration rejected."
        }

    Error Responses:
        - 400 Bad Request: Cannot reject active reviewer
        - 401 Unauthorized: Not authenticated
        - 403 Forbidden: Not an admin user
        - 404 Not Found: User does not exist

    Authentication: Required (Token)
    Permissions: Admin users only (is_staff=True)
    """

    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def delete(self, request, pk):
        """
        Reject pending reviewer registration by deleting the account.

        Args:
            request: HTTP request
            pk: User ID

        Returns:
            Response: Success message
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is in Reviewer group
        if not user.groups.filter(name='Reviewer').exists():
            return Response(
                {'error': 'User is not a reviewer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent deletion of active reviewers (safety check)
        if user.is_active:
            return Response(
                {'error': 'Cannot reject an active reviewer. Use the deactivate endpoint instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Delete the user account
        user.delete()

        return Response(
            {'message': 'Reviewer registration rejected.'},
            status=status.HTTP_200_OK
        )
