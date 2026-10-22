from django.db import models
from django.conf import settings
from courses.models import Course

User = settings.AUTH_USER_MODEL

class Assessment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assessments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    time_limit_minutes = models.PositiveIntegerField(default=30)
    passing_score = models.PositiveIntegerField(default=70, help_text='Passing percentage (e.g. 70 for 70%)')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_assessments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def total_possible_points(self):
        return sum(q.points for q in self.questions.all()) or 0


class Question(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice Question'
        TRUE_FALSE = 'TRUE_FALSE', 'True / False'

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MCQ)
    points = models.PositiveIntegerField(default=1)
    # Options format: [{"id": "A", "text": "Option A"}, {"id": "B", "text": "Option B"}]
    options = models.JSONField(default=list, help_text='List of option objects: [{"id": "A", "text": "..."}]')
    correct_answer = models.CharField(max_length=50, help_text='ID of the correct option (e.g. A, B, TRUE, etc.)')
    explanation = models.TextField(blank=True, default='', help_text='Explanation shown after submission.')
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class AssessmentAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        SUBMITTED = 'SUBMITTED', 'Submitted'

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(default=0)
    total_points = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title} ({self.percentage}%)"


class Answer(models.Model):
    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=50)
    is_correct = models.BooleanField(default=False)
    points_awarded = models.FloatField(default=0)

    def __str__(self):
        return f"Attempt {self.attempt.id} - Q{self.question.id}: {self.selected_option} ({'Correct' if self.is_correct else 'Wrong'})"
