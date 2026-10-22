from django.contrib import admin
from .models import Assignment, Submission

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'max_points', 'passing_points', 'is_active')
    list_filter = ('course', 'is_active', 'due_date')
    search_fields = ('title', 'description')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'submitted_at', 'status', 'score', 'graded_by')
    list_filter = ('status', 'submitted_at')
    search_fields = ('student__username', 'assignment__title')
