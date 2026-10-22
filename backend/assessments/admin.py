from django.contrib import admin
from .models import Assessment, Question, AssessmentAttempt, Answer

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'time_limit_minutes', 'passing_score', 'is_active', 'created_at')
    list_filter = ('course', 'is_active')
    search_fields = ('title', 'description')
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'order', 'question_text', 'question_type', 'points', 'correct_answer')
    list_filter = ('assessment', 'question_type')
    search_fields = ('question_text',)

@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'assessment', 'score', 'total_points', 'percentage', 'passed', 'start_time')
    list_filter = ('passed', 'assessment')
    search_fields = ('student__username', 'assessment__title')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'selected_option', 'is_correct', 'points_awarded')
