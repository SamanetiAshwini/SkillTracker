from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class ProficiencyLevel(models.TextChoices):
    BEGINNER = 'BEGINNER', 'Beginner'
    INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
    ADVANCED = 'ADVANCED', 'Advanced'
    EXPERT = 'EXPERT', 'Expert'

PROFICIENCY_WEIGHTS = {
    ProficiencyLevel.BEGINNER: 1,
    ProficiencyLevel.INTERMEDIATE: 2,
    ProficiencyLevel.ADVANCED: 3,
    ProficiencyLevel.EXPERT: 4,
}

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=80, default='General Technology')
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class StudentSkill(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    proficiency_level = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.BEGINNER
    )
    years_of_experience = models.FloatField(default=0.5)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'skill'], name='unique_student_skill')
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.username} - {self.skill.name}: {self.proficiency_level}"


class TargetRole(models.Model):
    title = models.CharField(max_length=150, unique=True)
    description = models.TextField()
    average_salary = models.CharField(max_length=80, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class TargetRoleSkill(models.Model):
    class Importance(models.TextChoices):
        MUST_HAVE = 'MUST_HAVE', 'Must Have'
        NICE_TO_HAVE = 'NICE_TO_HAVE', 'Nice to Have'

    target_role = models.ForeignKey(TargetRole, on_delete=models.CASCADE, related_name='role_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='role_skills')
    required_level = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.INTERMEDIATE
    )
    importance = models.CharField(
        max_length=20,
        choices=Importance.choices,
        default=Importance.MUST_HAVE
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['target_role', 'skill'], name='unique_role_skill')
        ]
        ordering = ['importance', 'skill__name']

    def __str__(self):
        return f"{self.target_role.title} requires {self.skill.name} ({self.required_level})"


class JobApplication(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        SCREENING = 'SCREENING', 'Resume Screening'
        INTERVIEWING = 'INTERVIEWING', 'Interviewing'
        OFFER = 'OFFER', 'Offer Received'
        REJECTED = 'REJECTED', 'Archived / Rejected'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    company = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150)
    application_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    job_url = models.URLField(max_length=500, blank=True, default='')
    salary_range = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-application_date', '-created_at']

    def __str__(self):
        return f"{self.student.username} - {self.company} ({self.job_title}): {self.status}"
