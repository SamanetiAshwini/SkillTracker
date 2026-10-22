from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    ModuleViewSet,
    TopicViewSet,
    BatchViewSet,
    TopicProgressUpdateView,
    MyEnrollmentsView,
)

router = DefaultRouter()
router.register(r'modules', ModuleViewSet, basename='modules')
router.register(r'topics', TopicViewSet, basename='topics')
router.register(r'batches', BatchViewSet, basename='batches')
router.register(r'', CourseViewSet, basename='courses')

urlpatterns = [
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('topics/<int:topic_id>/progress/', TopicProgressUpdateView.as_view(), name='topic-progress-update'),
    path('', include(router.urls)),
]
