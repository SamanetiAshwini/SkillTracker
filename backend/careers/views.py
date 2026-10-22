from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import (
    Skill,
    StudentSkill,
    TargetRole,
    TargetRoleSkill,
    JobApplication,
    ProficiencyLevel,
    PROFICIENCY_WEIGHTS,
)
from .serializers import (
    SkillSerializer,
    StudentSkillSerializer,
    TargetRoleSerializer,
    JobApplicationSerializer,
)
from accounts.permissions import IsMentorOrAdmin

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'category']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]


class StudentSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSkillSerializer

    def get_queryset(self):
        return StudentSkill.objects.filter(student=self.request.user).select_related('skill')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class TargetRoleViewSet(viewsets.ModelViewSet):
    queryset = TargetRole.objects.filter(is_active=True).prefetch_related('role_skills', 'role_skills__skill')
    serializer_class = TargetRoleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsMentorOrAdmin()]
        return [permissions.IsAuthenticated()]


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    filterset_fields = ['status']
    search_fields = ['company', 'job_title']

    def get_queryset(self):
        return JobApplication.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class SkillGapAnalyzerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, role_id=None):
        student = request.user
        if role_id:
            role = get_object_or_404(TargetRole, id=role_id)
        else:
            role = TargetRole.objects.filter(is_active=True).first()
            if not role:
                return Response({'detail': 'No active career target roles configured.'}, status=status.HTTP_404_NOT_FOUND)

        role_skills = role.role_skills.select_related('skill').all()
        student_skills_map = {
            ss.skill_id: ss
            for ss in StudentSkill.objects.filter(student=student).select_related('skill')
        }

        matched = []
        partial = []
        missing = []
        earned_weight = 0.0
        total_weight = float(len(role_skills)) if role_skills else 1.0

        for rs in role_skills:
            skill = rs.skill
            required_wt = PROFICIENCY_WEIGHTS.get(rs.required_level, 2)

            if skill.id in student_skills_map:
                ss = student_skills_map[skill.id]
                student_wt = PROFICIENCY_WEIGHTS.get(ss.proficiency_level, 1)

                if student_wt >= required_wt:
                    matched.append({
                        'skill_id': skill.id,
                        'skill_name': skill.name,
                        'category': skill.category,
                        'student_level': ss.proficiency_level,
                        'required_level': rs.required_level,
                        'importance': rs.importance,
                        'status': 'MATCHED'
                    })
                    earned_weight += 1.0
                else:
                    partial.append({
                        'skill_id': skill.id,
                        'skill_name': skill.name,
                        'category': skill.category,
                        'student_level': ss.proficiency_level,
                        'required_level': rs.required_level,
                        'importance': rs.importance,
                        'status': 'PARTIAL_GAP'
                    })
                    earned_weight += 0.5
            else:
                missing.append({
                    'skill_id': skill.id,
                    'skill_name': skill.name,
                    'category': skill.category,
                    'student_level': 'NOT_STARTED',
                    'required_level': rs.required_level,
                    'importance': rs.importance,
                    'status': 'MISSING'
                })

        coverage_percentage = round((earned_weight / total_weight) * 100, 1) if total_weight > 0 else 0

        # Learning priorities: missing MUST_HAVE skills first, then partial gaps
        recommended_priorities = [
            {
                'skill_name': item['skill_name'],
                'category': item['category'],
                'target_level': item['required_level'],
                'urgency': 'HIGH' if item['importance'] == 'MUST_HAVE' else 'MEDIUM',
                'action': 'Begin fundamentals and build practice projects'
            }
            for item in missing if item['importance'] == 'MUST_HAVE'
        ] + [
            {
                'skill_name': item['skill_name'],
                'category': item['category'],
                'target_level': item['required_level'],
                'urgency': 'MEDIUM',
                'action': f"Advance proficiency from {item['student_level']} to {item['required_level']}"
            }
            for item in partial
        ]

        return Response({
            'target_role': {
                'id': role.id,
                'title': role.title,
                'description': role.description,
                'average_salary': role.average_salary,
            },
            'summary': {
                'total_required_skills': len(role_skills),
                'matched_count': len(matched),
                'partial_count': len(partial),
                'missing_count': len(missing),
                'coverage_percentage': coverage_percentage,
            },
            'matched_skills': matched,
            'partially_matched_skills': partial,
            'missing_skills': missing,
            'recommended_priorities': recommended_priorities[:5],
            'disclaimer': 'This is a skills-coverage estimate to help prioritize your learning trajectory, not a guarantee of employment or hiring outcomes.'
        })
