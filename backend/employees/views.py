from rest_framework import viewsets, permissions
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR']:
            return Employee.objects.all()
        # Managers can see their department (simplified logic, normally more complex)
        # For now, regular employees see only themselves
        if user.role == 'EMPLOYEE':
            return Employee.objects.filter(user=user)
        return Employee.objects.all()
