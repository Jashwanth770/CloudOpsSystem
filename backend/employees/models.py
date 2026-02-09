from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from encrypted_model_fields.fields import EncryptedCharField, EncryptedIntegerField

User = get_user_model()

class Department(TimeStampedModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Employee(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    joining_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    # Sensitive Data (Encrypted)
    salary = EncryptedIntegerField(null=True, blank=True)
    bank_account_no = EncryptedCharField(max_length=50, blank=True)
    national_id = EncryptedCharField(max_length=50, blank=True)

    # Auto-generated ID
    employee_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.employee_id:
            # Generate ID: EMP-{id}
            # Only reliable way is to save first to get ID, then update
            # Or use a sequence. For simplicity, we'll use a count-based approach or UUID.
            # Getting next ID:
            last_emp = Employee.objects.all().order_by('id').last()
            if not last_emp:
                next_id = 1
            else:
                next_id = last_emp.id + 1 if self.pk is None else self.id # If creating, +1. If updating, use self.id? No, confusing.
                # Better approach: EMP + 4 digit padding of PK
            
            # Since we need PK for robust ID, we save first if it's new
            # BUT save calls save. infinite loop risk.
            
            # Alternative: Random/Count based
            count = Employee.objects.count()
            self.employee_id = f"EMP-{count + 1:04d}"
            
            # Handle collision
            while Employee.objects.filter(employee_id=self.employee_id).exists():
                count += 1
                self.employee_id = f"EMP-{count + 1:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()} ({self.designation})"
