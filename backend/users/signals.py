from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
from django.contrib.auth import get_user_model
from django.utils import timezone
import random

@receiver(post_migrate)
def create_demo_users(sender, **kwargs):
    # Only run for the users app to avoid multiple triggers
    if sender.name != 'users':
        return

    User = get_user_model()
    
    # Check if we should seed (usually for demo/dev, but we force it here for demo readiness)
    print("🚀 Auto-seeding demo users...")

    # We need to import Department/Employee here to avoid circular imports
    try:
        Employee = apps.get_model('employees', 'Employee')
        Department = apps.get_model('employees', 'Department')
    except (LookupError, ImportError):
        print("⚠️ Could not load Employee or Department model for seeding.")
        return

    # Create Departments
    it_dept, _ = Department.objects.get_or_create(name='IT', defaults={'description': 'Information Technology'})
    hr_dept, _ = Department.objects.get_or_create(name='HR', defaults={'description': 'Human Resources'})
    ops_dept, _ = Department.objects.get_or_create(name='Operations', defaults={'description': 'Business Operations'})

    users_data = [
        {
            'email': 'jashwanthsai8630@gmail.com',
            'password': 'password123',
            'role': 'SYSTEM_ADMIN',
            'first_name': 'Super',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'email': 'hr@example.com',
            'password': 'password123',
            'role': 'HR_MANAGER',
            'first_name': 'Helen',
            'last_name': 'Richards',
            'department': hr_dept,
            'designation': 'HR Manager'
        },
        {
            'email': 'manager@example.com',
            'password': 'password123',
            'role': 'MANAGER',
            'first_name': 'Mike',
            'last_name': 'Ross',
            'department': it_dept,
            'designation': 'Senior Tech Lead'
        },
        {
            'email': 'employee@example.com',
            'password': 'password123',
            'role': 'SOFTWARE_ENGINEER',
            'first_name': 'John',
            'last_name': 'Doe',
            'department': it_dept,
            'designation': 'Software Engineer'
        }
    ]

    for data in users_data:
        email = data['email']
        password = data.pop('password')
        role = data.pop('role')
        department = data.pop('department', None)
        designation = data.pop('designation', None)
        is_staff = data.pop('is_staff', False)
        is_superuser = data.pop('is_superuser', False)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'role': role,
                'two_factor_auth_type': 'NONE',
                'is_staff': is_staff,
                'is_superuser': is_superuser,
                **data
            }
        )

        # Force password and disable OTP for demo accounts
        user.set_password(password)
        user.two_factor_auth_type = 'NONE'
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.save()

        # Create Employee profile
        if role != 'SYSTEM_ADMIN':
            Employee.objects.get_or_create(
                user=user,
                defaults={
                    'department': department,
                    'designation': designation,
                    'joining_date': timezone.now().date(),
                }
            )
        
        status = "Created" if created else "Updated"
        print(f"✅ {status} User: {email}")
