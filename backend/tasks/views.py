from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR']:
            return Task.objects.all()
        if hasattr(user, 'employee_profile'):
            return Task.objects.filter(assigned_to=user.employee_profile) | Task.objects.filter(assigned_by=user)
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
