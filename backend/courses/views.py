from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Course, Batch, Module, Topic, Enrollment, TopicProgress
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateUpdateSerializer,
    ModuleSerializer,
    TopicSerializer,
    EnrollmentSerializer,
    TopicProgressSerializer,
    BatchSerializer,
)
from accounts.permissions import IsMentorOrAdmin, IsPlatformAdmin, IsStudent

class CourseViewSet(viewsets.ModelViewSet):
    lookup_field = 'id'
    filterset_fields = ['category', 'level', 'is_published']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['created_at', 'title', 'level']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Course.objects.filter(is_published=True)
        if user.role == 'ADMIN' or user.is_staff:
            return Course.objects.all()
        if user.role == 'MENTOR':
            return Course.objects.filter(mentor=user) | Course.objects.filter(is_published=True)
        return Course.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Automatically set mentor to request.user if mentor
        if self.request.user.role == 'MENTOR' and 'mentor' not in serializer.validated_data:
            serializer.save(mentor=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, id=None):
        course = self.get_object()
        user = request.user

        if user.role != 'STUDENT' and not user.is_staff:
            return Response(
                {'detail': 'Only students can enroll in courses.'},
                status=status.HTTP_403_FORBIDDEN
            )

        enrollment, created = Enrollment.objects.get_or_create(
            student=user,
            course=course,
            defaults={'status': Enrollment.Status.ACTIVE}
        )

        if not created and enrollment.status == Enrollment.Status.ACTIVE:
            return Response(
                {'detail': 'You are already actively enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif not created:
            enrollment.status = Enrollment.Status.ACTIVE
            enrollment.save()

        serializer = EnrollmentSerializer(enrollment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[IsMentorOrAdmin])
    def students(self, request, id=None):
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course).select_related('student', 'student__profile')
        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(serializer.data)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Module.objects.filter(course_id=course_id)
        return Module.objects.all()


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        module_id = self.request.query_params.get('module_id')
        if module_id:
            return Topic.objects.filter(module_id=module_id)
        return Topic.objects.all()


class TopicProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=TopicProgressSerializer, responses={200: TopicProgressSerializer})
    def post(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        new_status = request.data.get('status', TopicProgress.Status.IN_PROGRESS)

        if new_status not in [TopicProgress.Status.NOT_STARTED, TopicProgress.Status.IN_PROGRESS, TopicProgress.Status.COMPLETED]:
            return Response({'detail': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)

        progress, created = TopicProgress.objects.get_or_create(
            student=request.user,
            topic=topic,
            defaults={'status': new_status}
        )

        progress.status = new_status
        now = timezone.now()

        if new_status == TopicProgress.Status.IN_PROGRESS and not progress.start_date:
            progress.start_date = now
        elif new_status == TopicProgress.Status.COMPLETED:
            if not progress.start_date:
                progress.start_date = now
            progress.completion_date = now
        elif new_status == TopicProgress.Status.NOT_STARTED:
            progress.completion_date = None

        progress.save()

        # Check if entire course is now completed
        course = topic.module.course
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        if enrollment:
            pct = enrollment.calculate_progress_percentage()
            if pct >= 100 and enrollment.status != Enrollment.Status.COMPLETED:
                enrollment.status = Enrollment.Status.COMPLETED
                enrollment.completed_at = now
                enrollment.save()

        return Response({
            'message': f'Topic status updated to {new_status}.',
            'progress': TopicProgressSerializer(progress).data,
            'course_progress_percentage': enrollment.calculate_progress_percentage() if enrollment else 0
        })


class MyEnrollmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course', 'course__mentor')
        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(serializer.data)


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]
