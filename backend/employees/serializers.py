from rest_framework import serializers
from .models import Employee, Department
from users.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'user', 'department', 'department_details', 'designation', 'phone_number', 'address', 'joining_date', 'is_active']
