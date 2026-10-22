from rest_framework import serializers
from .models import Project
from accounts.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'student', 'title', 'description', 'tags',
            'github_url', 'live_demo_url', 'image_url',
            'is_featured', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
