from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import Leave
from .serializers import LeaveSerializer
from users.permissions import IsAdminOrHR, IsManager

class LeaveViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR']:
            return Leave.objects.all()
        
        if user.role == 'MANAGER':
            if hasattr(user, 'employee_profile') and user.employee_profile.department:
                # See own leaves + department leaves
                return Leave.objects.filter(employee__department=user.employee_profile.department) | Leave.objects.filter(employee=user.employee_profile)
        
        if hasattr(user, 'employee_profile'):
            return Leave.objects.filter(employee=user.employee_profile)
            
        return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminOrHR | IsManager])
    def approve(self, request, pk=None):
        leave = self.get_object()
        # Permission logic already handled by permission_classes mostly, but keeping role check for safety if needed
        # or simplified since IsManager/IsAdminOrHR is applied.
        
        leave.status = Leave.Status.APPROVED
        leave.approver = request.user
        leave.save()
        return Response(LeaveSerializer(leave).data)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminOrHR | IsManager])
    def reject(self, request, pk=None):
        leave = self.get_object()
        
        reason = request.data.get('reason', '')
        leave.status = Leave.Status.REJECTED
        leave.approver = request.user
        leave.rejection_reason = reason
        leave.save()
        return Response(LeaveSerializer(leave).data)
