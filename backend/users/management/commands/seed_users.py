from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from employees.models import Employee, Department
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test users'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create Departments
        it_dept, _ = Department.objects.get_or_create(name='IT', description='Information Technology')
        hr_dept, _ = Department.objects.get_or_create(name='HR', description='Human Resources')
        ops_dept, _ = Department.objects.get_or_create(name='Operations', description='Business Operations')

        users_data = [
            {
                'email': 'jashwanthsai8630@gmail.com',
                'password': 'admin123',
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
            },
             {
                'email': 'bob@example.com',
                'password': 'password123',
                'role': 'OPERATIONS_EXEC',
                'first_name': 'Bob',
                'last_name': 'Smith',
                'department': ops_dept,
                'designation': 'Ops Analyst'
            }
        ]

        for data in users_data:
            role = data.pop('role')
            department = data.pop('department', None)
            designation = data.pop('designation', None)
            
            # Create or Update User
            is_staff = data.pop('is_staff', False)
            is_superuser = data.pop('is_superuser', False)
            
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'],
                    'role': role,
                    'two_factor_auth_type': 'NONE',
                    'is_staff': is_staff,
                    'is_superuser': is_superuser,
                    **data
                }
            )

            if not created:
                # Force password and role for existing demo users
                user.set_password(data['password'])
                user.two_factor_auth_type = 'NONE'
                user.role = role
                user.is_staff = is_staff
                user.is_superuser = is_superuser
                for key, value in data.items():
                    setattr(user, key, value)
                user.save()
                self.stdout.write(f"Updated User: {user.email}")
            else:
                user.set_password(data['password']) # create_user handles hashing but get_or_create doesn't. 
                # Actually create_user is safer.
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created {role}: {user.email}"))

            # Create or Update Employee Profile if not admin
            if role != 'ADMIN':
                Employee.objects.get_or_create(
                    user=user,
                    defaults={
                        'department': department,
                        'designation': designation,
                        'joining_date': timezone.now().date(),
                        'address': f"123 {role} St",
                        'phone_number': f"555-010{random.randint(0,9)}"
                    }
                )
            
            self.stdout.write(self.style.SUCCESS(f"Created {role}: {user.email}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
