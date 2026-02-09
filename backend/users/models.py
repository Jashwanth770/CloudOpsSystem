from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        # Administration
        SYSTEM_ADMIN = 'SYSTEM_ADMIN', 'System Admin'
        OFFICE_ADMIN = 'OFFICE_ADMIN', 'Office Admin'

        # HR
        HR_EXEC = 'HR_EXEC', 'HR Executive'
        HR_MANAGER = 'HR_MANAGER', 'HR Manager'
        RECRUITER = 'RECRUITER', 'Recruiter'
        PAYROLL_OFFICER = 'PAYROLL_OFFICER', 'Payroll Officer'

        # Management
        MANAGER = 'MANAGER', 'Manager'
        TEAM_LEAD = 'TEAM_LEAD', 'Team Lead'
        PROJECT_MANAGER = 'PROJECT_MANAGER', 'Project Manager'
        DEPT_HEAD = 'DEPT_HEAD', 'Department Head'

        # Engineering
        SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER', 'Software Engineer'
        BACKEND_DEV = 'BACKEND_DEV', 'Backend Developer'
        FRONTEND_DEV = 'FRONTEND_DEV', 'Frontend Developer'
        DEVOPS = 'DEVOPS', 'DevOps Engineer'
        QA_ENGINEER = 'QA_ENGINEER', 'QA Engineer'

        # Finance
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
        FINANCE_MANAGER = 'FINANCE_MANAGER', 'Finance Manager'

        # Operations
        OPERATIONS_EXEC = 'OPERATIONS_EXEC', 'Operations Executive'
        OPERATIONS_MANAGER = 'OPERATIONS_MANAGER', 'Operations Manager'

        # Sales
        SALES_EXEC = 'SALES_EXEC', 'Sales Executive'
        SALES_MANAGER = 'SALES_MANAGER', 'Sales Manager'

        # Marketing
        MARKETING_EXEC = 'MARKETING_EXEC', 'Marketing Executive'
        MARKETING_MANAGER = 'MARKETING_MANAGER', 'Marketing Manager'

        # Customer Support
        SUPPORT_EXEC = 'SUPPORT_EXEC', 'Support Executive'
        SUPPORT_MANAGER = 'SUPPORT_MANAGER', 'Support Manager'

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.SOFTWARE_ENGINEER
    )
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    class TwoFactorType(models.TextChoices):
        NONE = 'NONE', 'None'
        APP = 'APP', 'Authenticator App'
        EMAIL = 'EMAIL', 'Email OTP'
        SMS = 'SMS', 'SMS OTP'

    two_factor_auth_type = models.CharField(
        max_length=10,
        choices=TwoFactorType.choices,
        default=TwoFactorType.EMAIL
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.role})"
