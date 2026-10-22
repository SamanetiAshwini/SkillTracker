from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssessmentViewSet, AssessmentAttemptViewSet

router = DefaultRouter()
router.register(r'attempts', AssessmentAttemptViewSet, basename='attempts')
router.register(r'', AssessmentViewSet, basename='assessments')

urlpatterns = [
    path('', include(router.urls)),
]
