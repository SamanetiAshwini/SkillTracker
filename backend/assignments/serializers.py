from rest_framework import serializers
from .models import Assignment, Submission
from accounts.serializers import UserSerializer

class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    graded_by = UserSerializer(read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    max_points = serializers.IntegerField(source='assignment.max_points', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'max_points',
            'student', 'submission_text', 'submission_url', 'attachment_file',
            'submitted_at', 'status', 'score', 'feedback', 'graded_by', 'graded_at'
        ]
        read_only_fields = ['id', 'student', 'submitted_at', 'score', 'feedback', 'graded_by', 'graded_at']


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['submission_text', 'submission_url', 'attachment_file']

    def validate(self, attrs):
        if not attrs.get('submission_text') and not attrs.get('submission_url') and not attrs.get('attachment_file'):
            raise serializers.ValidationError("Please provide at least a text answer, a project link, or an attachment file.")
        return attrs


class SubmissionGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['score', 'feedback', 'status']

    def validate_score(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Score cannot be negative.")
        return value


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_title', 'module', 'title',
            'description', 'due_date', 'max_points', 'passing_points',
            'attachment_url', 'is_active', 'created_by', 'created_at',
            'my_submission'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = Submission.objects.filter(assignment=obj, student=request.user).first()
            if submission:
                return SubmissionSerializer(submission).data
        return None
