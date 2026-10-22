from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SkillViewSet,
    StudentSkillViewSet,
    TargetRoleViewSet,
    JobApplicationViewSet,
    SkillGapAnalyzerView,
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'my-skills', StudentSkillViewSet, basename='my-skills')
router.register(r'target-roles', TargetRoleViewSet, basename='target-roles')
router.register(r'job-applications', JobApplicationViewSet, basename='job-applications')

urlpatterns = [
    path('gap-analysis/', SkillGapAnalyzerView.as_view(), name='gap-analysis-default'),
    path('gap-analysis/<int:role_id>/', SkillGapAnalyzerView.as_view(), name='gap-analysis-role'),
    path('', include(router.urls)),
]
