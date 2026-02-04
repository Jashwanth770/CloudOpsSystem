from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['employee', 'status']

class AttendanceClockInSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['date', 'clock_in']
