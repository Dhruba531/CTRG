from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin for User model.
    Extends Django's built-in UserAdmin to add expertise_tags field.
    """
    list_display = ['username', 'email', 'first_name', 'last_name', 'get_roles', 'is_active', 'is_staff']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'groups']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    # Add expertise_tags to fieldsets
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('expertise_tags',)
        }),
    )
    
    def get_roles(self, obj):
        """Display user's groups/roles"""
        return ", ".join([group.name for group in obj.groups.all()])
    get_roles.short_description = 'Roles'
