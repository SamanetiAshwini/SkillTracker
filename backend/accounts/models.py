from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        MENTOR = 'MENTOR', _('Mentor')
        ADMIN = 'ADMIN', _('Administrator')

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text=_('Designates platform role and permissions.')
    )

    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['-date_joined']

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_mentor(self):
        return self.role == self.Role.MENTOR

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN or self.is_superuser or self.is_staff

    def __str__(self):
        full = f"{self.first_name} {self.last_name}".strip()
        return f"{full} ({self.username})" if full else self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    headline = models.CharField(max_length=200, blank=True, default='', help_text=_('e.g. Full-Stack Developer | Python & React enthusiast'))
    bio = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    location = models.CharField(max_length=120, blank=True, default='')
    github_url = models.URLField(max_length=300, blank=True, default='')
    linkedin_url = models.URLField(max_length=300, blank=True, default='')
    portfolio_url = models.URLField(max_length=300, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
