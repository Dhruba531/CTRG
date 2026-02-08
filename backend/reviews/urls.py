"""
URL patterns for the reviews module.
"""
from rest_framework.routers import DefaultRouter
from .views import ReviewerProfileViewSet, ReviewAssignmentViewSet

router = DefaultRouter()
router.register(r'reviewers', ReviewerProfileViewSet, basename='reviewerprofile')
router.register(r'assignments', ReviewAssignmentViewSet, basename='reviewassignment')

urlpatterns = router.urls
