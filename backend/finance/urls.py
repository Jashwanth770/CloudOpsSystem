from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalaryStructureViewSet, PayslipViewSet, ExpenseClaimViewSet

router = DefaultRouter()
router.register(r'salary-structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'payslips', PayslipViewSet, basename='payslip')
router.register(r'expenses', ExpenseClaimViewSet, basename='expense-claim')

urlpatterns = [
    path('', include(router.urls)),
]
