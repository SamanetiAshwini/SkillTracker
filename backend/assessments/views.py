from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Assessment, Question, AssessmentAttempt, Answer
from .serializers import (
    AssessmentListSerializer,
    AssessmentDetailSerializer,
    AssessmentAttemptResultSerializer,
    QuestionMentorSerializer,
    SubmitQuizSerializer,
)
from accounts.permissions import IsMentorOrAdmin

class AssessmentViewSet(viewsets.ModelViewSet):
    filterset_fields = ['course', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Assessment.objects.none()
        if user.role == 'ADMIN' or user.is_staff:
            return Assessment.objects.all().prefetch_related('questions')
        if user.role == 'MENTOR':
            return Assessment.objects.filter(course__mentor=user).prefetch_related('questions') | Assessment.objects.filter(is_active=True).prefetch_related('questions')
        # Student sees active assessments for enrolled courses
        return Assessment.objects.filter(course__enrollments__student=user, is_active=True).distinct().prefetch_related('questions')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssessmentDetailSerializer
        return AssessmentListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_question']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def take(self, request, pk=None):
        """
        Endpoint to retrieve questions for taking the assessment.
        Excludes correct answers and explanations.
        """
        assessment = self.get_object()
        serializer = AssessmentDetailSerializer(assessment, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Backend-enforced grading endpoint.
        Calculates score accurately on the server side.
        """
        assessment = self.get_object()
        user = request.user

        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers_data = serializer.validated_data.get('answers', [])
        answer_dict = {item['question_id']: item['selected_option'] for item in answers_data}

        questions = assessment.questions.all()
        total_possible_points = sum(q.points for q in questions)
        earned_points = 0

        attempt = AssessmentAttempt.objects.create(
            assessment=assessment,
            student=user,
            start_time=timezone.now(),
            end_time=timezone.now(),
            status=AssessmentAttempt.Status.SUBMITTED
        )

        for q in questions:
            selected = answer_dict.get(q.id, '')
            is_correct = (selected.strip().upper() == q.correct_answer.strip().upper())
            points_awarded = q.points if is_correct else 0
            if is_correct:
                earned_points += points_awarded

            Answer.objects.create(
                attempt=attempt,
                question=q,
                selected_option=selected,
                is_correct=is_correct,
                points_awarded=points_awarded
            )

        percentage = round((earned_points / total_possible_points * 100), 1) if total_possible_points > 0 else 0
        passed = percentage >= assessment.passing_score

        attempt.score = earned_points
        attempt.total_points = total_possible_points
        attempt.percentage = percentage
        attempt.passed = passed
        attempt.save()

        result_serializer = AssessmentAttemptResultSerializer(attempt)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsMentorOrAdmin])
    def add_question(self, request, pk=None):
        assessment = self.get_object()
        serializer = QuestionMentorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(assessment=assessment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssessmentAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssessmentAttemptResultSerializer
    filterset_fields = ['assessment', 'passed']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssessmentAttempt.objects.none()
        if user.role == 'ADMIN' or user.is_staff:
            return AssessmentAttempt.objects.all().select_related('student', 'assessment', 'assessment__course').prefetch_related('answers', 'answers__question')
        if user.role == 'MENTOR':
            return AssessmentAttempt.objects.filter(assessment__course__mentor=user).select_related('student', 'assessment').prefetch_related('answers', 'answers__question')
        return AssessmentAttempt.objects.filter(student=user).select_related('assessment', 'assessment__course').prefetch_related('answers', 'answers__question')
