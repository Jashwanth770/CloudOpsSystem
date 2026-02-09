from rest_framework import serializers
from .models import SalaryStructure, Payslip, ExpenseClaim
from employees.serializers import EmployeeSerializer

class SalaryStructureSerializer(serializers.ModelSerializer):
    net_salary = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = ['id', 'employee', 'basic_salary', 'hra', 'allowances', 'deductions', 'net_salary', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PayslipSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Payslip
        fields = ['id', 'employee', 'employee_details', 'month', 'year', 'total_earnings', 'total_deductions', 'net_pay', 'status', 'generated_at']
        read_only_fields = ['generated_at']

class ExpenseClaimSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.ReadOnlyField(source='approved_by.get_full_name')

    class Meta:
        model = ExpenseClaim
        fields = ['id', 'employee', 'title', 'amount', 'category', 'receipt', 'status', 'approved_by', 'approved_by_name', 'rejection_reason', 'created_at']
        read_only_fields = ['employee', 'status', 'approved_by', 'rejection_reason', 'created_at']
