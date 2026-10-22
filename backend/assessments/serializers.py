from rest_framework import serializers
from .models import Assessment, Question, AssessmentAttempt, Answer
from accounts.serializers import UserSerializer

class QuestionStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'options', 'order']


class QuestionMentorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'assessment', 'question_text', 'question_type', 'points', 'options', 'correct_answer', 'explanation', 'order']


class AssessmentListSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    my_latest_attempt = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'time_limit_minutes', 'passing_score', 'is_active',
            'questions_count', 'my_latest_attempt', 'created_at'
        ]

    def get_my_latest_attempt(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempt = AssessmentAttempt.objects.filter(assessment=obj, student=request.user).first()
            if attempt:
                return {
                    'id': attempt.id,
                    'score': attempt.score,
                    'total_points': attempt.total_points,
                    'percentage': attempt.percentage,
                    'passed': attempt.passed,
                    'start_time': attempt.start_time
                }
        return None


class AssessmentDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    questions = QuestionStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'time_limit_minutes', 'passing_score', 'questions'
        ]


class AnswerResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)
    options = serializers.JSONField(source='question.options', read_only=True)

    class Meta:
        model = Answer
        fields = [
            'id', 'question', 'question_text', 'options',
            'selected_option', 'correct_answer', 'is_correct',
            'points_awarded', 'explanation'
        ]


class AssessmentAttemptResultSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    course_title = serializers.CharField(source='assessment.course.title', read_only=True)
    passing_score = serializers.IntegerField(source='assessment.passing_score', read_only=True)
    student = UserSerializer(read_only=True)
    answers = AnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentAttempt
        fields = [
            'id', 'assessment', 'assessment_title', 'course_title',
            'passing_score', 'student', 'start_time', 'end_time',
            'score', 'total_points', 'percentage', 'passed',
            'status', 'answers'
        ]


class SingleAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.CharField(max_length=50)


class SubmitQuizSerializer(serializers.Serializer):
    answers = SingleAnswerInputSerializer(many=True)
