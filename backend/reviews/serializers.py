"""
Serializers for the reviews module.
"""
from rest_framework import serializers
from .models import ReviewerProfile, ReviewAssignment, Stage1Score, Stage2Review


class ReviewerProfileSerializer(serializers.ModelSerializer):
    """Serializer for ReviewerProfile."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    current_workload = serializers.SerializerMethodField()
    can_accept_more = serializers.SerializerMethodField()
    
    class Meta:
        model = ReviewerProfile
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'department', 'area_of_expertise', 'max_review_load', 'is_active_reviewer',
            'current_workload', 'can_accept_more'
        ]
        read_only_fields = ['user']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_current_workload(self, obj):
        return obj.current_review_count()
    
    def get_can_accept_more(self, obj):
        return obj.can_accept_review()


class Stage1ScoreSerializer(serializers.ModelSerializer):
    """Serializer for Stage 1 Review Scores."""
    total_score = serializers.IntegerField(read_only=True)
    percentage_score = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Stage1Score
        fields = [
            'id', 'assignment',
            'originality_score', 'clarity_score', 'literature_review_score',
            'methodology_score', 'impact_score', 'publication_potential_score',
            'budget_appropriateness_score', 'timeline_practicality_score',
            'narrative_comments', 'total_score', 'percentage_score',
            'submitted_at', 'is_draft'
        ]
        read_only_fields = ['assignment', 'submitted_at']
    
    def validate(self, data):
        """Validate score ranges."""
        score_limits = {
            'originality_score': 15,
            'clarity_score': 15,
            'literature_review_score': 15,
            'methodology_score': 15,
            'impact_score': 15,
            'publication_potential_score': 10,
            'budget_appropriateness_score': 10,
            'timeline_practicality_score': 5,
        }
        
        for field, max_val in score_limits.items():
            if field in data:
                if data[field] < 0 or data[field] > max_val:
                    raise serializers.ValidationError({
                        field: f"Score must be between 0 and {max_val}"
                    })
        
        return data


class Stage2ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Stage 2 Review."""
    concerns_addressed_display = serializers.CharField(
        source='get_concerns_addressed_display', read_only=True
    )
    revised_recommendation_display = serializers.CharField(
        source='get_revised_recommendation_display', read_only=True
    )
    
    class Meta:
        model = Stage2Review
        fields = [
            'id', 'assignment',
            'concerns_addressed', 'concerns_addressed_display',
            'revised_recommendation', 'revised_recommendation_display',
            'revised_score', 'technical_comments', 'budget_comments',
            'submitted_at', 'is_draft'
        ]
        read_only_fields = ['assignment', 'submitted_at']


class ReviewAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Review Assignments."""
    stage1_score = Stage1ScoreSerializer(read_only=True)
    stage2_review = Stage2ReviewSerializer(read_only=True)
    proposal_title = serializers.CharField(source='proposal.title', read_only=True)
    proposal_code = serializers.CharField(source='proposal.proposal_code', read_only=True)
    reviewer_name = serializers.SerializerMethodField()
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ReviewAssignment
        fields = [
            'id', 'proposal', 'proposal_title', 'proposal_code',
            'reviewer', 'reviewer_name', 'reviewer_email',
            'stage', 'stage_display', 'status', 'status_display',
            'deadline', 'assigned_date', 'notification_sent',
            'stage1_score', 'stage2_review',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_date', 'created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name() or obj.reviewer.username


class ReviewAssignmentCreateSerializer(serializers.Serializer):
    """Serializer for creating review assignments."""
    proposal_id = serializers.IntegerField()
    reviewer_ids = serializers.ListField(child=serializers.IntegerField())
    stage = serializers.IntegerField()
    deadline = serializers.DateTimeField()


class ReviewerWorkloadSerializer(serializers.Serializer):
    """Serializer for reviewer workload stats (matches frontend Reviewer type)."""
    id = serializers.IntegerField()
    user = serializers.IntegerField()
    user_email = serializers.EmailField()
    user_name = serializers.CharField()
    is_active_reviewer = serializers.BooleanField()
    max_review_load = serializers.IntegerField()
    department = serializers.CharField(allow_blank=True)
    area_of_expertise = serializers.CharField(allow_blank=True)
    current_workload = serializers.IntegerField()
    can_accept_more = serializers.BooleanField()
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    completed = serializers.IntegerField()
    stage1_pending = serializers.IntegerField()
    stage2_pending = serializers.IntegerField()
