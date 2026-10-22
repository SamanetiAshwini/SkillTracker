from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submissions')
router.register(r'', AssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
]
