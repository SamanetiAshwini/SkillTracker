from django.contrib import admin
from .models import Skill, StudentSkill, TargetRole, TargetRoleSkill, JobApplication

class TargetRoleSkillInline(admin.TabularInline):
    model = TargetRoleSkill
    extra = 2

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    search_fields = ('name', 'category')

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'proficiency_level', 'years_of_experience', 'verified')
    list_filter = ('proficiency_level', 'verified')
    search_fields = ('student__username', 'skill__name')

@admin.register(TargetRole)
class TargetRoleAdmin(admin.ModelAdmin):
    list_display = ('title', 'average_salary', 'is_active')
    inlines = [TargetRoleSkillInline]

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'company', 'job_title', 'status', 'application_date')
    list_filter = ('status', 'application_date')
    search_fields = ('student__username', 'company', 'job_title')
