from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from courses.models import Course, Enrollment
from assignments.models import Assignment, Submission

class AssignmentAndSubmissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.mentor = User.objects.create_user(
            username='mentor_user', email='mentor@test.com', password='Password123!', role=User.Role.MENTOR
        )
        self.student = User.objects.create_user(
            username='student_user', email='student@test.com', password='Password123!', role=User.Role.STUDENT
        )
        self.other_student = User.objects.create_user(
            username='other_student', email='other@test.com', password='Password123!', role=User.Role.STUDENT
        )
        self.course = Course.objects.create(
            title='Python APIs', description='Desc', mentor=self.mentor, is_published=True
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        self.assignment = Assignment.objects.create(
            course=self.course,
            title='Homework 1',
            description='Build an API',
            due_date=timezone.now() + timedelta(days=5),
            max_points=100,
            passing_points=60,
            created_by=self.mentor
        )

    def test_student_submission_creation(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post(f'/api/assignments/{self.assignment.id}/submit/', {
            'submission_text': 'Here is my solution',
            'submission_url': 'https://github.com/test/repo'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'PENDING')

    def test_student_cannot_grade_submission(self):
        self.client.force_authenticate(user=self.student)
        submission = Submission.objects.create(
            assignment=self.assignment,
            student=self.student,
            submission_text='Work done'
        )
        res = self.client.post(f'/api/assignments/submissions/{submission.id}/grade/', {
            'score': 100,
            'feedback': 'Self awarded'
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_mentor_grading_success_and_validation(self):
        submission = Submission.objects.create(
            assignment=self.assignment,
            student=self.student,
            submission_text='Work done'
        )
        self.client.force_authenticate(user=self.mentor)

        # Exceeds max points -> fails
        invalid_res = self.client.post(f'/api/assignments/submissions/{submission.id}/grade/', {
            'score': 120,
            'feedback': 'Exceeds max'
        })
        self.assertEqual(invalid_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid grade
        valid_res = self.client.post(f'/api/assignments/submissions/{submission.id}/grade/', {
            'score': 88,
            'feedback': 'Great code structure.'
        })
        self.assertEqual(valid_res.status_code, status.HTTP_200_OK)
        submission.refresh_from_db()
        self.assertEqual(submission.score, 88)
        self.assertEqual(submission.status, 'GRADED')
