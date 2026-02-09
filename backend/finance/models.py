from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from employees.models import Employee

User = get_user_model()

class SalaryStructure(TimeStampedModel):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, help_text="House Rent Allowance")
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Tax, PF, etc.")
    
    @property
    def net_salary(self):
        return self.basic_salary + self.hra + self.allowances - self.deductions

    def __str__(self):
        return f"Salary Structure - {self.employee}"

class Payslip(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        PAID = 'PAID', 'Paid'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    month = models.DateField(help_text="First day of the month")
    year = models.IntegerField()
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"Payslip - {self.employee} - {self.month.strftime('%B %Y')}"

class ExpenseClaim(TimeStampedModel):
    class Category(models.TextChoices):
        TRAVEL = 'TRAVEL', 'Travel'
        FOOD = 'FOOD', 'Food'
        EQUIPMENT = 'EQUIPMENT', 'Equipment'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        PAID = 'PAID', 'Paid'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=Category.choices)
    receipt = models.FileField(upload_to='expenses/%Y/%m/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    rejection_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.status})"
