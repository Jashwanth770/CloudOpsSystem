from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import Leave
from .serializers import LeaveSerializer

class LeaveViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR']:
            return Leave.objects.all()
        if user.role == 'MANAGER':
            # Managers see their own leaves AND leaves of their department
            # Simplified: managers see all leaves for now, or just their own + leaves where they are approver (if logic existed)
            # Better: manager sees employees in their department
            if hasattr(user, 'employee_profile') and user.employee_profile.department:
                return Leave.objects.filter(employee__department=user.employee_profile.department)
        if hasattr(user, 'employee_profile'):
            return Leave.objects.filter(employee=user.employee_profile)
        return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)

    @decorators.action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if request.user.role not in ['MANAGER', 'HR', 'ADMIN']:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        leave.status = Leave.Status.APPROVED
        leave.approver = request.user
        leave.save()
        return Response(LeaveSerializer(leave).data)

    @decorators.action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if request.user.role not in ['MANAGER', 'HR', 'ADMIN']:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        reason = request.data.get('reason', '')
        leave.status = Leave.Status.REJECTED
        leave.approver = request.user
        leave.rejection_reason = reason
        leave.save()
        return Response(LeaveSerializer(leave).data)
