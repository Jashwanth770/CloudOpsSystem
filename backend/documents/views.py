from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
from users.permissions import IsAdmin, IsManager, IsEmployee

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Admin sees all
        if user.role in ['SYSTEM_ADMIN', 'ADMIN']:
            return Document.objects.all()
        
        # Others see only their department's documents
        if hasattr(user, 'employee_profile') and user.employee_profile.department:
            return Document.objects.filter(department=user.employee_profile.department)
        
        return Document.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'employee_profile') or not user.employee_profile.department:
            raise permissions.exceptions.PermissionDenied("You must be assigned to a department to upload documents.")
        
        serializer.save(uploaded_by=user, department=user.employee_profile.department)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Only Admin or Manager of that department can delete
        if user.role in ['SYSTEM_ADMIN', 'ADMIN']:
            return super().destroy(request, *args, **kwargs)
        
        if user.role in ['MANAGER', 'DEPT_HEAD', 'HR_MANAGER', 'FINANCE_MANAGER', 'OPERATIONS_MANAGER', 'SALES_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_MANAGER']:
            if instance.department == user.employee_profile.department:
                 return super().destroy(request, *args, **kwargs)
        
        return Response({'error': 'You do not have permission to delete this document.'}, status=status.HTTP_403_FORBIDDEN)
