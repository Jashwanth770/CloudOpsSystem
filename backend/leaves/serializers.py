from rest_framework import serializers
from .models import Leave

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)

    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['employee', 'status', 'approver', 'rejection_reason']
