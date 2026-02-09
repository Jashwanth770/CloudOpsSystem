from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import SalaryStructure, Payslip, ExpenseClaim
from .serializers import SalaryStructureSerializer, PayslipSerializer, ExpenseClaimSerializer
from users.permissions import IsAdmin, IsManager, IsEmployee
from users.permissions import IsAdmin, IsManager, IsEmployee
from rest_framework.pagination import PageNumberPagination

class IsAccountant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['ACCOUNTANT', 'FINANCE_MANAGER', 'SYSTEM_ADMIN', 'OFFICE_ADMIN']

class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee__id']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']

class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all()
    serializer_class = PayslipSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['year', 'month']
    ordering_fields = ['year', 'month']
    ordering = ['-year', '-month']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ACCOUNTANT', 'FINANCE_MANAGER', 'SYSTEM_ADMIN']:
            return Payslip.objects.all()
        if hasattr(user, 'employee_profile'):
            return Payslip.objects.filter(employee=user.employee_profile)
        return Payslip.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[IsAccountant])
    def generate_bulk(self, request):
        """Placeholder for bulk generation logic"""
        # Logic to iterate visible employees and create payslips based on SalaryStructure
        return Response({"status": "Bulk generation logic to be implemented"}, status=status.HTTP_200_OK)

class ExpenseClaimViewSet(viewsets.ModelViewSet):
    queryset = ExpenseClaim.objects.all()
    serializer_class = ExpenseClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ACCOUNTANT', 'FINANCE_MANAGER', 'SYSTEM_ADMIN']:
            return ExpenseClaim.objects.all()
        # Managers see their team's expenses (Logic needs Department hierarchy or specific team link)
        # For now, let's allow Managers to see all within their department if implemented, 
        # but simplistically: Employees see own, Managers see all? 
        # Refined: Employees see own. Managers see approval queue.
        if hasattr(user, 'employee_profile'):
            return ExpenseClaim.objects.filter(employee=user.employee_profile)
        return ExpenseClaim.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'employee_profile'):
            serializer.save(employee=self.request.user.employee_profile)
        else:
             serializer.save() # Admin creating?

    @action(detail=True, methods=['post'], permission_classes=[IsManager | IsAccountant]) # Allow Manager or Finance to approve
    def approve(self, request, pk=None):
        claim = self.get_object()
        claim.status = ExpenseClaim.Status.APPROVED
        claim.approved_by = request.user
        claim.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsManager | IsAccountant])
    def reject(self, request, pk=None):
        claim = self.get_object()
        claim.status = ExpenseClaim.Status.REJECTED
        claim.rejection_reason = request.data.get('reason', '')
        claim.approved_by = request.user
        claim.save()
        return Response({'status': 'rejected'})
