"""
Admin configuration for the proposals module.
"""
from django.contrib import admin
from .models import GrantCycle, Proposal, Stage1Decision, FinalDecision, AuditLog


@admin.register(GrantCycle)
class GrantCycleAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'year']
    search_fields = ['name', 'year']
    ordering = ['-year', '-created_at']
    date_hierarchy = 'start_date'


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ['proposal_code', 'title', 'pi_name', 'cycle', 'status', 'fund_requested', 'submitted_at']
    list_filter = ['status', 'cycle', 'pi_department']
    search_fields = ['proposal_code', 'title', 'pi_name', 'pi_email']
    ordering = ['-created_at']
    readonly_fields = ['proposal_code', 'created_at', 'updated_at', 'submitted_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('proposal_code', 'title', 'abstract', 'cycle', 'status')
        }),
        ('PI Information', {
            'fields': ('pi_name', 'pi_department', 'pi_email', 'co_investigators')
        }),
        ('Funding & Files', {
            'fields': ('fund_requested', 'proposal_file', 'application_template_file', 
                      'revised_proposal_file', 'response_to_reviewers_file')
        }),
        ('Timestamps', {
            'fields': ('revision_deadline', 'created_at', 'submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Stage1Decision)
class Stage1DecisionAdmin(admin.ModelAdmin):
    list_display = ['proposal', 'decision', 'average_score', 'decision_date']
    list_filter = ['decision', 'decision_date']
    search_fields = ['proposal__proposal_code', 'proposal__title']


@admin.register(FinalDecision)
class FinalDecisionAdmin(admin.ModelAdmin):
    list_display = ['proposal', 'decision', 'approved_grant_amount', 'decision_date']
    list_filter = ['decision', 'decision_date']
    search_fields = ['proposal__proposal_code', 'proposal__title']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'user', 'proposal', 'timestamp']
    list_filter = ['action_type', 'timestamp']
    search_fields = ['user__username', 'proposal__proposal_code']
    readonly_fields = ['user', 'action_type', 'proposal', 'timestamp', 'details']
