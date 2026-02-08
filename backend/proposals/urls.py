"""
URL patterns for the proposals module.
"""
from rest_framework.routers import DefaultRouter
from .views import GrantCycleViewSet, ProposalViewSet, DashboardViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'cycles', GrantCycleViewSet, basename='grantcycle')
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = router.urls
