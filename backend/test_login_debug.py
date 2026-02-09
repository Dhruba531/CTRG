"""
Test script to debug login issue
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.serializers import LoginSerializer
from django.test import RequestFactory

# Create a fake request
factory = RequestFactory()
request = factory.post('/api/auth/login/', {
    'email': 'reviewer1@nsu.edu',
    'password': 'reviewer123'
}, content_type='application/json')

# Create serializer with request context
serializer = LoginSerializer(
    data={'email': 'reviewer1@nsu.edu', 'password': 'reviewer123'},
    context={'request': request}
)

# Try validation
print("Testing login serializer validation...")
print(f"Data: {serializer.initial_data}")

try:
    is_valid = serializer.is_valid(raise_exception=True)
    print(f"Validation result: {is_valid}")
    print(f"Validated data: {serializer.validated_data}")
    print(f"User: {serializer.validated_data.get('user')}")
except Exception as e:
    print(f"Validation failed with error: {type(e).__name__}")
    print(f"Error details: {str(e)}")
    print(f"Serializer errors: {serializer.errors}")
