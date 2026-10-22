from django.contrib import admin
from .models import Course, Batch, Module, Topic, Enrollment, TopicProgress

class TopicInline(admin.StackedInline):
    model = Topic
    extra = 1

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'mentor', 'is_published', 'created_at')
    list_filter = ('category', 'level', 'is_published')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title',)
    inlines = [TopicInline]

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'content_type', 'duration_minutes', 'order')
    list_filter = ('content_type', 'module__course')
    search_fields = ('title', 'content')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at', 'completed_at')
    list_filter = ('status', 'enrolled_at')
    search_fields = ('student__username', 'student__email', 'course__title')

@admin.register(TopicProgress)
class TopicProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'topic', 'status', 'start_date', 'completion_date', 'updated_at')
    list_filter = ('status',)
    search_fields = ('student__username', 'topic__title')

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'start_date', 'end_date', 'is_active')
