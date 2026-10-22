from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Project
from .serializers import ProjectSerializer
from accounts.permissions import IsOwnerOrAdmin

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().select_related('student')
    serializer_class = ProjectSerializer
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'is_featured']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        projects = Project.objects.filter(student=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
