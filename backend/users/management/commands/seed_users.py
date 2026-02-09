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
                'password': 'password123',
                'role': 'ADMIN',
                'first_name': 'Super',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'email': 'hr@example.com',
                'password': 'password123',
                'role': 'HR',
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
                'role': 'EMPLOYEE',
                'first_name': 'John',
                'last_name': 'Doe',
                'department': it_dept,
                'designation': 'Software Engineer'
            },
             {
                'email': 'bob@example.com',
                'password': 'password123',
                'role': 'EMPLOYEE',
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
            
            if User.objects.filter(email=data['email']).exists():
                self.stdout.write(f"User {data['email']} already exists")
                continue

            # Create User
            is_staff = data.pop('is_staff', False)
            is_superuser = data.pop('is_superuser', False)
            
            user = User.objects.create_user(
                username=data['email'], # Username is email for simplicity in this script, though model uses email
                role=role,
                **data
            )
            user.is_staff = is_staff
            user.is_superuser = is_superuser
            user.save()

            # Create Employee Profile if not admin
            if role != 'ADMIN':
                Employee.objects.create(
                    user=user,
                    department=department,
                    designation=designation,
                    joining_date=timezone.now().date(),
                    address=f"123 {role} St",
                    phone_number=f"555-010{random.randint(0,9)}"
                )
            
            self.stdout.write(self.style.SUCCESS(f"Created {role}: {user.email}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
