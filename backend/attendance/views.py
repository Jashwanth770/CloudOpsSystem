from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from django.utils import timezone
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR']:
            return Attendance.objects.all()
        if hasattr(user, 'employee_profile'):
            return Attendance.objects.filter(employee=user.employee_profile)
        return Attendance.objects.none()

    @decorators.action(detail=False, methods=['post'])
    def clock_in(self, request):
        employee = request.user.employee_profile
        today = timezone.now().date()
        
        attendance, created = Attendance.objects.get_or_create(employee=employee, date=today)
        if attendance.clock_in:
            return Response({"error": "Already clocked in"}, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.clock_in = timezone.now()
        attendance.status = Attendance.Status.PRESENT
        attendance.save()
        return Response(AttendanceSerializer(attendance).data)

    @decorators.action(detail=False, methods=['post'])
    def clock_out(self, request):
        employee = request.user.employee_profile
        today = timezone.now().date()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
            if not attendance.clock_in:
                return Response({"error": "Not clocked in"}, status=status.HTTP_400_BAD_REQUEST)
            if attendance.clock_out:
                return Response({"error": "Already clocked out"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendance.clock_out = timezone.now()
            attendance.save()
            return Response(AttendanceSerializer(attendance).data)
        except Attendance.DoesNotExist:
            return Response({"error": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND)
