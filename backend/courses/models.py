from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    class Level(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=100, default='Software Development')
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    thumbnail_url = models.URLField(max_length=500, blank=True, default='')
    mentor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mentored_courses'
    )
    is_published = models.BooleanField(default=True)
    estimated_hours = models.PositiveIntegerField(default=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def total_topics_count(self):
        return Topic.objects.filter(module__course=self).count()


class Batch(models.Model):
    name = models.CharField(max_length=120)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name_plural = 'Batches'

    def __str__(self):
        return f"{self.name} - {self.course.title}"


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.course.title} - Module {self.order}: {self.title}"


class Topic(models.Model):
    class ContentType(models.TextChoices):
        ARTICLE = 'ARTICLE', 'Article'
        VIDEO = 'VIDEO', 'Video Lesson'
        EXERCISE = 'EXERCISE', 'Hands-on Exercise'
        RESOURCE = 'RESOURCE', 'Reference Resource'

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)
    content_type = models.CharField(max_length=20, choices=ContentType.choices, default=ContentType.ARTICLE)
    content = models.TextField(help_text='Rich learning content or markdown notes.')
    resource_url = models.URLField(max_length=500, blank=True, default='')
    duration_minutes = models.PositiveIntegerField(default=20)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.module.title} - Topic {self.order}: {self.title}"


class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        DROPPED = 'DROPPED', 'Dropped'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'course'], name='unique_student_course_enrollment')
        ]
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.username} -> {self.course.title} ({self.status})"

    def calculate_progress_percentage(self):
        total_topics = self.course.total_topics_count
        if total_topics == 0:
            return 0
        completed_topics = TopicProgress.objects.filter(
            student=self.student,
            topic__module__course=self.course,
            status=TopicProgress.Status.COMPLETED
        ).count()
        return round((completed_topics / total_topics) * 100)


class TopicProgress(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', 'Not Started'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topic_progresses')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='student_progresses')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    start_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'topic'], name='unique_student_topic_progress')
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.username} - {self.topic.title}: {self.status}"
