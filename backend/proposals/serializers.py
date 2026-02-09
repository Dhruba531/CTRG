"""
Serializers for the proposals module.
"""
from rest_framework import serializers
from .models import GrantCycle, Proposal, Stage1Decision, FinalDecision, AuditLog


class GrantCycleSerializer(serializers.ModelSerializer):
    """Serializer for Grant Cycle model."""
    proposal_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GrantCycle
        fields = [
            'id', 'name', 'year', 'start_date', 'end_date',
            'stage1_review_start_date', 'stage1_review_end_date',
            'stage2_review_start_date', 'stage2_review_end_date',
            'revision_window_days', 'acceptance_threshold', 'max_reviewers_per_proposal',
            'is_active', 'proposal_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_proposal_count(self, obj):
        return obj.proposals.count()


class GrantCycleStatsSerializer(serializers.Serializer):
    """Serializer for cycle statistics."""
    total_proposals = serializers.IntegerField()
    submitted = serializers.IntegerField()
    under_stage1_review = serializers.IntegerField()
    stage1_rejected = serializers.IntegerField()
    accepted_no_corrections = serializers.IntegerField()
    tentatively_accepted = serializers.IntegerField()
    revision_requested = serializers.IntegerField()
    revised_submitted = serializers.IntegerField()
    under_stage2_review = serializers.IntegerField()
    final_accepted = serializers.IntegerField()
    final_rejected = serializers.IntegerField()
    revision_deadline_missed = serializers.IntegerField()


class ProposalListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for proposal lists."""
    cycle_name = serializers.CharField(source='cycle.name', read_only=True)
    pi_display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_code', 'title', 'pi_name', 'pi_department',
            'pi_display_name', 'cycle', 'cycle_name', 'status', 
            'fund_requested', 'submitted_at', 'revision_deadline'
        ]
    
    def get_pi_display_name(self, obj):
        return obj.pi_name or 'Unknown'


class ProposalSerializer(serializers.ModelSerializer):
    """Full serializer for proposal detail."""
    cycle_name = serializers.CharField(source='cycle.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_revision_overdue = serializers.BooleanField(read_only=True)
    
    # Make PI fields optional in serializer (will be auto-filled from authenticated user)
    pi_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    pi_department = serializers.CharField(max_length=255, required=False, allow_blank=True)
    pi_email = serializers.EmailField(required=False, allow_blank=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_code', 'title', 'abstract',
            'pi_name', 'pi_department', 'pi_email',
            'co_investigators', 'fund_requested',
            'proposal_file', 'application_template_file',
            'revised_proposal_file', 'response_to_reviewers_file',
            'cycle', 'cycle_name', 'status', 'status_display',
            'created_at', 'submitted_at', 'updated_at', 'revision_deadline',
            'is_revision_overdue'
        ]
        read_only_fields = [
            'proposal_code', 'status', 'created_at', 'submitted_at', 
            'updated_at', 'revision_deadline'
        ]
    
    def validate(self, data):
        """Auto-populate PI information from authenticated user during validation."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Auto-fill PI information from user if not provided
            if not data.get('pi_email'):
                data['pi_email'] = request.user.email
            if not data.get('pi_name'):
                data['pi_name'] = request.user.get_full_name() or request.user.username
            if not data.get('pi_department'):
                data['pi_department'] = 'Not Specified'
        return data
    
    def create(self, validated_data):
        return super().create(validated_data)


class ProposalSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a proposal."""
    pass  # No additional data needed, just action


class RevisionSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a revision."""
    revised_proposal_file = serializers.FileField(required=True)
    response_to_reviewers_file = serializers.FileField(required=False)


class Stage1DecisionSerializer(serializers.ModelSerializer):
    """Serializer for Stage 1 Decision."""
    proposal_code = serializers.CharField(source='proposal.proposal_code', read_only=True)
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)
    
    class Meta:
        model = Stage1Decision
        fields = [
            'id', 'proposal', 'proposal_code', 'decision', 'decision_display',
            'decision_date', 'chair_comments', 'average_score'
        ]
        read_only_fields = ['decision_date', 'average_score']


class Stage1DecisionCreateSerializer(serializers.Serializer):
    """Serializer for creating Stage 1 Decision."""
    decision = serializers.ChoiceField(choices=Stage1Decision.Decision.choices)
    chair_comments = serializers.CharField(required=False, allow_blank=True)


class FinalDecisionSerializer(serializers.ModelSerializer):
    """Serializer for Final Decision."""
    proposal_code = serializers.CharField(source='proposal.proposal_code', read_only=True)
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)
    
    class Meta:
        model = FinalDecision
        fields = [
            'id', 'proposal', 'proposal_code', 'decision', 'decision_display',
            'decision_date', 'approved_grant_amount', 'final_remarks'
        ]
        read_only_fields = ['decision_date']


class FinalDecisionCreateSerializer(serializers.Serializer):
    """Serializer for creating Final Decision."""
    decision = serializers.ChoiceField(choices=FinalDecision.Decision.choices)
    approved_grant_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    final_remarks = serializers.CharField()


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for Audit Logs."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    proposal_code = serializers.CharField(source='proposal.proposal_code', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'action_type', 
            'proposal', 'proposal_code', 'timestamp', 'details'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    total_proposals = serializers.IntegerField()
    pending_reviews = serializers.IntegerField()
    awaiting_decision = serializers.IntegerField()
    awaiting_revision = serializers.IntegerField()
    status_breakdown = serializers.DictField()
