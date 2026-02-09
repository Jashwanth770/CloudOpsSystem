from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer
from users.permissions import IsAdmin, IsHR, IsManager, IsEmployee, IsAdminOrHR

User = get_user_model()

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrHR]
        return [permission() for permission in permission_classes]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHR | IsManager]
        elif self.action == 'destroy':
            permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHR]
        elif self.action in ['update', 'partial_update']:
            # HR/Admin can update anyone. Managers/Employees usually limited (handled in serializer/queryset or here)
            # For simplicity, enabling Admin/HR/Manager to update
            permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHR | IsManager] 
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        
        # Admin / HR / Managers see all active employees (Global Directory)
        if any(r in user.role for r in ['ADMIN', 'HR', 'MANAGER', 'HEAD']):
            return Employee.objects.all()
        
        # Everyone else (Engineers, Support, etc) -> No Access to Directory
        if user.role == 'EMPLOYEE' or True: # Fallback for all other roles
             return Employee.objects.filter(user=user) # Only see self, or return none() if we want to hide page completely

             
    def perform_destroy(self, instance):
        # We want to delete the User, which will cascade delete the Employee profile.
        # If we just delete instance (Employee), the User remains but without a profile.
        user = instance.user
        user.delete()

    def create(self, request, *args, **kwargs):
        # Transaction ensures both User and Employee are created, or neither
        try:
            with transaction.atomic():
                user_data = {
                    'email': request.data.get('email'),
                    'username': request.data.get('email'), # Use email as username
                    'first_name': request.data.get('first_name'),
                    'last_name': request.data.get('last_name'),
                    'role': request.data.get('role', 'EMPLOYEE'),
                    'is_active': True
                }
                password = request.data.get('password')
                
                # Check if User already exists
                email = user_data['email']
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    if hasattr(user, 'employee_profile'): # Check via related_name or reverse query
                         # Or safer: 
                         if Employee.objects.filter(user=user).exists():
                              return Response({'error': f'Employee with email {email} already exists.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Update existing user info
                    user.first_name = user_data['first_name']
                    user.last_name = user_data['last_name']
                    # logic for role update if needed, but 'role' in user_data might be 'EMPLOYEE'
                    # If they were 'ADMIN' maybe we shouldn't downgrade? 
                    # For now let's trust the input or keep existing role if it's higher?
                    # The requirement isn't specified, but updating role to what's requested seems consistent with "Add Employee"
                    user.role = user_data['role'] 
                    user.save()
                else:
                    # Create User
                    user = User.objects.create_user(**user_data, password=password)

                # Get or Create Department
                dept_id = request.data.get('department') or request.data.get('department_id')
                if dept_id:
                     department = Department.objects.get(id=dept_id)
                else:
                     # Fallback or create text-based dept if provided
                     dept_name = request.data.get('department_name', 'General')
                     department, _ = Department.objects.get_or_create(name=dept_name)

                # Create Employee Profile
                employee = Employee.objects.create(
                    user=user,
                    department=department,
                    designation=request.data.get('designation', 'Staff'),
                    phone_number=request.data.get('phone_number', ''),
                    address=request.data.get('address', ''),
                    joining_date=request.data.get('joining_date')
                )
                
                serializer = self.get_serializer(employee)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
