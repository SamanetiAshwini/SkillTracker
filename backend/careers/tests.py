from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from careers.models import (
    Skill,
    StudentSkill,
    TargetRole,
    TargetRoleSkill,
    JobApplication,
    ProficiencyLevel
)

class SkillGapAnalyzerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student_user', email='student@test.com', password='Password123!', role=User.Role.STUDENT
        )
        self.python_skill = Skill.objects.create(name='Python', category='Languages')
        self.django_skill = Skill.objects.create(name='Django', category='Frameworks')
        self.docker_skill = Skill.objects.create(name='Docker', category='DevOps')

        self.role = TargetRole.objects.create(
            title='Junior Python Dev',
            description='Test role'
        )
        TargetRoleSkill.objects.create(
            target_role=self.role,
            skill=self.python_skill,
            required_level=ProficiencyLevel.INTERMEDIATE,
            importance=TargetRoleSkill.Importance.MUST_HAVE
        )
        TargetRoleSkill.objects.create(
            target_role=self.role,
            skill=self.django_skill,
            required_level=ProficiencyLevel.INTERMEDIATE,
            importance=TargetRoleSkill.Importance.MUST_HAVE
        )
        TargetRoleSkill.objects.create(
            target_role=self.role,
            skill=self.docker_skill,
            required_level=ProficiencyLevel.BEGINNER,
            importance=TargetRoleSkill.Importance.NICE_TO_HAVE
        )

    def test_skill_gap_analysis_calculation(self):
        self.client.force_authenticate(user=self.student)

        # Student only has Python at ADVANCED level
        StudentSkill.objects.create(
            student=self.student,
            skill=self.python_skill,
            proficiency_level=ProficiencyLevel.ADVANCED
        )

        res = self.client.get(f'/api/careers/gap-analysis/{self.role.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data
        self.assertEqual(data['summary']['total_required_skills'], 3)
        self.assertEqual(data['summary']['matched_count'], 1)  # Python
        self.assertEqual(data['summary']['missing_count'], 2)  # Django and Docker
        self.assertAlmostEqual(data['summary']['coverage_percentage'], 33.3, places=1)

        # Verify Django is prioritized high because it is MUST_HAVE
        self.assertTrue(any(p['skill_name'] == 'Django' and p['urgency'] == 'HIGH' for p in data['recommended_priorities']))

    def test_job_application_crud(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post('/api/careers/job-applications/', {
            'company': 'Tech Corp',
            'job_title': 'Junior Engineer',
            'application_date': '2026-10-22',
            'status': 'APPLIED',
            'salary_range': '$80k'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(JobApplication.objects.filter(student=self.student, company='Tech Corp').exists())
