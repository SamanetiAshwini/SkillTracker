from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from courses.models import Course, Module, Topic, Enrollment, TopicProgress

class CourseAndProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.mentor = User.objects.create_user(
            username='mentor_user', email='mentor@test.com', password='Password123!', role=User.Role.MENTOR
        )
        self.student = User.objects.create_user(
            username='student_user', email='student@test.com', password='Password123!', role=User.Role.STUDENT
        )
        self.course = Course.objects.create(
            title='Test Architecture Course',
            description='Test course description',
            category='Backend',
            level=Course.Level.BEGINNER,
            mentor=self.mentor,
            is_published=True
        )
        self.mod = Module.objects.create(course=self.course, title='Module 1', order=1)
        self.topic1 = Topic.objects.create(module=self.mod, title='Topic 1', order=1, content='Test')
        self.topic2 = Topic.objects.create(module=self.mod, title='Topic 2', order=2, content='Test')

    def test_student_enrollment_and_uniqueness(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())

        # Attempt duplicate enrollment
        dup_res = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_topic_progress_and_course_completion_calculation(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/courses/{self.course.id}/enroll/')

        # 0% initially
        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        self.assertEqual(enrollment.calculate_progress_percentage(), 0)

        # Complete topic 1 -> 50%
        res = self.client.post(f'/api/courses/topics/{self.topic1.id}/progress/', {
            'status': TopicProgress.Status.COMPLETED
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['course_progress_percentage'], 50)

        # Complete topic 2 -> 100% and auto-mark enrollment as COMPLETED
        res2 = self.client.post(f'/api/courses/topics/{self.topic2.id}/progress/', {
            'status': TopicProgress.Status.COMPLETED
        })
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['course_progress_percentage'], 100)
        enrollment.refresh_from_db()
        self.assertEqual(enrollment.status, Enrollment.Status.COMPLETED)
