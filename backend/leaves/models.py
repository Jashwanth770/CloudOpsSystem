from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from employees.models import Employee

User = get_user_model()

class Leave(TimeStampedModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    
    class LeaveType(models.TextChoices):
        SICK = 'SICK', 'Sick Leave'
        CASUAL = 'CASUAL', 'Casual Leave'
        ANNUAL = 'ANNUAL', 'Annual Leave'
        OTHER = 'OTHER', 'Other'

    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    rejection_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"
