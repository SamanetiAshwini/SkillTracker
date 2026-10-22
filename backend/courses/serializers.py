from rest_framework import serializers
from .models import Course, Batch, Module, Topic, Enrollment, TopicProgress
from accounts.serializers import UserSerializer

class TopicProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicProgress
        fields = ['id', 'topic', 'status', 'start_date', 'completion_date', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class TopicSerializer(serializers.ModelSerializer):
    student_progress = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id', 'module', 'title', 'content_type', 'content',
            'resource_url', 'duration_minutes', 'order', 'created_at',
            'student_progress'
        ]

    def get_student_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = TopicProgress.objects.filter(student=request.user, topic=obj).first()
            if progress:
                return {
                    'status': progress.status,
                    'start_date': progress.start_date,
                    'completion_date': progress.completion_date,
                    'updated_at': progress.updated_at
                }
        return {'status': 'NOT_STARTED', 'start_date': None, 'completion_date': None}


class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 'topics', 'created_at']


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'course', 'start_date', 'end_date', 'is_active', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    mentor = UserSerializer(read_only=True)
    total_topics = serializers.IntegerField(source='total_topics_count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'level',
            'thumbnail_url', 'mentor', 'is_published', 'estimated_hours',
            'total_topics', 'is_enrolled', 'progress_percentage', 'created_at'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(student=request.user, course=obj, status=Enrollment.Status.ACTIVE).exists()
        return False

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(student=request.user, course=obj).first()
            if enrollment:
                return enrollment.calculate_progress_percentage()
        return 0


class CourseDetailSerializer(serializers.ModelSerializer):
    mentor = UserSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    batches = BatchSerializer(many=True, read_only=True)
    total_topics = serializers.IntegerField(source='total_topics_count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'level',
            'thumbnail_url', 'mentor', 'is_published', 'estimated_hours',
            'total_topics', 'modules', 'batches', 'is_enrolled',
            'progress_percentage', 'created_at', 'updated_at'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(student=request.user, course=obj, status=Enrollment.Status.ACTIVE).exists()
        return False

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(student=request.user, course=obj).first()
            if enrollment:
                return enrollment.calculate_progress_percentage()
        return 0


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'level',
            'thumbnail_url', 'mentor', 'is_published', 'estimated_hours'
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )
    progress_percentage = serializers.SerializerMethodField()
    student_details = UserSerializer(source='student', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_details', 'course', 'course_id',
            'batch', 'status', 'enrolled_at', 'completed_at',
            'progress_percentage'
        ]
        read_only_fields = ['id', 'student', 'enrolled_at', 'progress_percentage']

    def get_progress_percentage(self, obj):
        return obj.calculate_progress_percentage()
