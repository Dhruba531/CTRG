"""
URL Configuration for User Authentication Endpoints

This module defines URL patterns for all user authentication and management
endpoints in the CTRG Grant System.

Endpoints:
    - POST /login/ - User login
    - POST /logout/ - User logout
    - GET /user/ - Get current user profile
    - POST /register/ - Create new user (admin only)
    - POST /change-password/ - Change password
    - GET /users/ - List all users (admin only)
    - GET /users/<id>/ - Get specific user details (admin only)
    - PUT /users/<id>/ - Update user (admin only)
    - DELETE /users/<id>/ - Delete user (admin only)

Authentication: All endpoints except /login/ require token authentication
"""

from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    UserRegistrationView,
    ChangePasswordView,
    UserListView,
    UserDetailView
)

# App name for namespacing (optional but recommended)
app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    # User login with email/password, returns auth token

    path('logout/', LogoutView.as_view(), name='logout'),
    # User logout, destroys auth token

    path('user/', CurrentUserView.as_view(), name='current-user'),
    # Get current authenticated user's profile

    # User management endpoints (admin only)
    path('register/', UserRegistrationView.as_view(), name='register'),
    # Create new user account (SRC Chair only)

    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    # Change current user's password

    path('users/', UserListView.as_view(), name='user-list'),
    # List all users (admin only)

    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    # Get, update, or delete specific user (admin only)
]
