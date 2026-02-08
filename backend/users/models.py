from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model for CTRG System.
    Extends Django's AbstractUser to add expertise_tags and other profile fields.
    """
    email = models.EmailField(unique=True)
    expertise_tags = models.JSONField(default=list, blank=True, help_text="List of expertise areas for reviewer matching.")
    
    # Roles will be handled via Django Groups ("PI", "Reviewer", "Admin", "SRC_Chair")

    def __str__(self):
        return self.email
