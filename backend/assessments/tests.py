from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from courses.models import Course, Enrollment
from assessments.models import Assessment, Question, AssessmentAttempt

class AssessmentEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.mentor = User.objects.create_user(
            username='mentor_user', email='mentor@test.com', password='Password123!', role=User.Role.MENTOR
        )
        self.student = User.objects.create_user(
            username='student_user', email='student@test.com', password='Password123!', role=User.Role.STUDENT
        )
        self.course = Course.objects.create(
            title='Python Fundamentals', description='Desc', mentor=self.mentor, is_published=True
        )
        Enrollment.objects.create(student=self.student, course=self.course)

        self.quiz = Assessment.objects.create(
            course=self.course,
            title='Midterm Quiz',
            time_limit_minutes=15,
            passing_score=70,
            is_active=True,
            created_by=self.mentor
        )
        self.q1 = Question.objects.create(
            assessment=self.quiz,
            order=1,
            question_text='What is 2 + 2?',
            question_type=Question.QuestionType.MCQ,
            points=10,
            options=[{'id': 'A', 'text': '3'}, {'id': 'B', 'text': '4'}],
            correct_answer='B',
            explanation='2 + 2 equals 4.'
        )
        self.q2 = Question.objects.create(
            assessment=self.quiz,
            order=2,
            question_text='Is Python interpreted?',
            question_type=Question.QuestionType.TRUE_FALSE,
            points=10,
            options=[{'id': 'TRUE', 'text': 'True'}, {'id': 'FALSE', 'text': 'False'}],
            correct_answer='TRUE',
            explanation='Python compiles to bytecode and is interpreted by the CPython VM.'
        )

    def test_student_take_quiz_hides_correct_answers(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f'/api/assessments/{self.quiz.id}/take/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Verify correct_answer and explanation are NOT leaked in student payload
        for q in res.data['questions']:
            self.assertNotIn('correct_answer', q)
            self.assertNotIn('explanation', q)

    def test_backend_submission_scoring_and_pass_determination(self):
        self.client.force_authenticate(user=self.student)
        # Submit: Q1 correct ('B'), Q2 wrong ('FALSE') -> 10/20 = 50% (< 70% passing)
        payload = {
            'answers': [
                {'question_id': self.q1.id, 'selected_option': 'B'},
                {'question_id': self.q2.id, 'selected_option': 'FALSE'},
            ]
        }
        res = self.client.post(f'/api/assessments/{self.quiz.id}/submit/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['score'], 10.0)
        self.assertEqual(res.data['total_points'], 20.0)
        self.assertEqual(res.data['percentage'], 50.0)
        self.assertFalse(res.data['passed'])

        # Now submit both correct -> 100% and passed
        pass_payload = {
            'answers': [
                {'question_id': self.q1.id, 'selected_option': 'B'},
                {'question_id': self.q2.id, 'selected_option': 'TRUE'},
            ]
        }
        pass_res = self.client.post(f'/api/assessments/{self.quiz.id}/submit/', pass_payload, format='json')
        self.assertEqual(pass_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(pass_res.data['score'], 20.0)
        self.assertEqual(pass_res.data['percentage'], 100.0)
        self.assertTrue(pass_res.data['passed'])
