from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User

class AuthAndRoleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='test_student',
            email='student@test.com',
            password='Password123!',
            role=User.Role.STUDENT
        )
        self.mentor = User.objects.create_user(
            username='test_mentor',
            email='mentor@test.com',
            password='Password123!',
            role=User.Role.MENTOR
        )
        self.admin = User.objects.create_user(
            username='test_admin',
            email='admin@test.com',
            password='Password123!',
            role=User.Role.ADMIN,
            is_staff=True
        )

    def test_student_registration_success(self):
        data = {
            'username': 'new_user',
            'email': 'new_user@test.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'role': 'STUDENT'
        }
        res = self.client.post('/api/auth/register/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertEqual(res.data['user']['role'], 'STUDENT')

    def test_login_success_with_email_and_username(self):
        # Login with username
        res = self.client.post('/api/auth/login/', {'login': 'test_student', 'password': 'Password123!'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data['tokens'])

        # Login with email
        res2 = self.client.post('/api/auth/login/', {'login': 'student@test.com', 'password': 'Password123!'})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

    def test_login_failure_invalid_password(self):
        res = self.client.post('/api/auth/login/', {'login': 'test_student', 'password': 'WrongPassword!'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieval_and_update(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'test_student')

        patch_res = self.client.patch('/api/auth/me/', {
            'headline': 'Updated Engineer Headline',
            'location': 'New York, NY'
        })
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.student.profile.refresh_from_db()
        self.assertEqual(self.student.profile.headline, 'Updated Engineer Headline')

    def test_admin_user_management_permissions(self):
        # Student cannot access admin users list
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/auth/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access and toggle activation
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/auth/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        patch_res = self.client.patch(f'/api/auth/admin/users/{self.student.id}/', {'is_active': False})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_active)
