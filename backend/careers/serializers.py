from rest_framework import serializers
from .models import Skill, StudentSkill, TargetRole, TargetRoleSkill, JobApplication

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = StudentSkill
        fields = [
            'id', 'skill', 'skill_name', 'skill_category',
            'proficiency_level', 'years_of_experience', 'verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']


class TargetRoleSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = TargetRoleSkill
        fields = [
            'id', 'skill', 'skill_name', 'skill_category',
            'required_level', 'importance'
        ]


class TargetRoleSerializer(serializers.ModelSerializer):
    role_skills = TargetRoleSkillSerializer(many=True, read_only=True)

    class Meta:
        model = TargetRole
        fields = [
            'id', 'title', 'description', 'average_salary',
            'is_active', 'role_skills', 'created_at'
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            'id', 'student', 'company', 'job_title', 'application_date',
            'status', 'job_url', 'salary_range', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
