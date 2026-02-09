from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import ApprovalRequest
from .serializers import ApprovalRequestSerializer
from users.permissions import IsAdminOrHR, IsManager

class ApprovalRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Requester sees their own requests
        if user.role == 'EMPLOYEE':
            return ApprovalRequest.objects.filter(requester=user)
        
        # Approvers (Managers/HR) see requests assigned to them or generic view
        if user.role == 'MANAGER':
            return ApprovalRequest.objects.filter(approver=user) | ApprovalRequest.objects.filter(requester=user)
            
        if user.role in ['ADMIN', 'HR']:
            return ApprovalRequest.objects.all()
            
        return ApprovalRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminOrHR | IsManager])
    def action(self, request, pk=None):
        approval = self.get_object()
        action = request.data.get('action') # 'APPROVE' or 'REJECT'
        comment = request.data.get('comments', '')

        if action == 'APPROVE':
            approval.status = 'APPROVED'
        elif action == 'REJECT':
            approval.status = 'REJECTED'
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        approval.comments = comment
        approval.approver = request.user
        approval.save()
        
        return Response(ApprovalRequestSerializer(approval).data)
