from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer
from users.permissions import IsAdmin, IsManager, IsAdminOrManager

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            # Only Managers/Admins can assign tasks
            permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        # Allow 'ADMIN' (legacy) and all specific admin/manager roles
        all_management_roles = [
            'ADMIN', 'SYSTEM_ADMIN', 'OFFICE_ADMIN', 
            'HR_MANAGER', 'HR_EXEC', 
            'MANAGER', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEPT_HEAD'
        ]
        
        if user.role in all_management_roles:
            # Admins, HR, and explicit 'MANAGER' role see ALL tasks
            # (Simplifying: if you are in management, you likely need to see what's going on. 
            #  Sticking to request: Admin/Manager delete tasks. To delete, they must see them.)
            if user.role in ['ADMIN', 'SYSTEM_ADMIN', 'OFFICE_ADMIN', 'HR_MANAGER', 'HR_EXEC', 'MANAGER']:
                return Task.objects.all()
            
            # Other leads see tasks relevant to them (or all, if we want to be generous. Let's restrict slightly for lower management)
             # But if they are 'MANAGER' they fall into above.
             # If they are PROJECT_MANAGER etc, let's show them all for now to avoid "I can't see tasks" issues,
             # unless strict privacy is requested.
             # For now, let's return ALL for all management roles to ensure visibility.
            return Task.objects.all()
        
        # Regular Employees see only tasks assigned to them
        if hasattr(user, 'employee_profile'):
            emp_profile = user.employee_profile
            # Standard: Tasks assigned TO me
            qs = Task.objects.filter(assigned_to=emp_profile)
            
            # Plus: Tasks assigned BY me (if I created any)
            qs = qs | Task.objects.filter(assigned_by=user)
            
            return qs.distinct()
            
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
