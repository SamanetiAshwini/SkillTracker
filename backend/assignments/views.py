from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Assignment, Submission
from .serializers import (
    AssignmentSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
    SubmissionGradeSerializer,
)
from accounts.permissions import IsMentorOrAdmin, IsStudent

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    filterset_fields = ['course', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Assignment.objects.none()
        if user.role == 'ADMIN' or user.is_staff:
            return Assignment.objects.all()
        if user.role == 'MENTOR':
            return Assignment.objects.filter(course__mentor=user) | Assignment.objects.filter(is_active=True)
        # Student sees assignments for courses they are enrolled in
        return Assignment.objects.filter(course__enrollments__student=user, is_active=True).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        user = request.user

        if user.role != 'STUDENT' and not user.is_staff:
            return Response({'detail': 'Only students can submit assignments.'}, status=status.HTTP_403_FORBIDDEN)

        # Check existing submission or create new/resubmit
        submission = Submission.objects.filter(assignment=assignment, student=user).first()
        is_new = submission is None
        serializer = SubmissionCreateSerializer(data=request.data)
        if serializer.is_valid():
            if not is_new:
                submission.submission_text = serializer.validated_data.get('submission_text', submission.submission_text)
                submission.submission_url = serializer.validated_data.get('submission_url', submission.submission_url)
                if serializer.validated_data.get('attachment_file'):
                    submission.attachment_file = serializer.validated_data.get('attachment_file')
                submission.status = Submission.Status.PENDING
                submission.submitted_at = timezone.now()
                submission.save()
            else:
                submission = Submission.objects.create(
                    assignment=assignment,
                    student=user,
                    submission_text=serializer.validated_data.get('submission_text', ''),
                    submission_url=serializer.validated_data.get('submission_url', ''),
                    attachment_file=serializer.validated_data.get('attachment_file', None),
                    status=Submission.Status.PENDING
                )
            return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED if is_new else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    filterset_fields = ['assignment', 'status']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Submission.objects.none()
        if user.role == 'ADMIN' or user.is_staff:
            return Submission.objects.all().select_related('student', 'assignment', 'graded_by')
        if user.role == 'MENTOR':
            return Submission.objects.filter(assignment__course__mentor=user).select_related('student', 'assignment', 'graded_by')
        return Submission.objects.filter(student=user).select_related('assignment', 'graded_by')

    def get_permissions(self):
        if self.action in ['grade']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsMentorOrAdmin])
    def grade(self, request, pk=None):
        submission = self.get_object()
        serializer = SubmissionGradeSerializer(data=request.data)
        if serializer.is_valid():
            score = serializer.validated_data.get('score')
            feedback = serializer.validated_data.get('feedback', '')
            status_val = serializer.validated_data.get('status', Submission.Status.GRADED)

            if score > submission.assignment.max_points:
                return Response({'score': [f"Score cannot exceed maximum points ({submission.assignment.max_points})."]}, status=status.HTTP_400_BAD_REQUEST)

            submission.score = score
            submission.feedback = feedback
            submission.status = status_val
            submission.graded_by = request.user
            submission.graded_at = timezone.now()
            submission.save()

            return Response(SubmissionSerializer(submission).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
