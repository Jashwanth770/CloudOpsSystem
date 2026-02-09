import os
import django
from django.utils import timezone
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from employees.models import Employee, Department

def create_users():
    users_data = [
        {'email': 'jashwanthsai8630@gmail.com', 'password': 'password123', 'role': User.Roles.ADMIN, 'first_name': 'Super', 'last_name': 'Admin'},
        {'email': 'hr@cloudops.com', 'password': 'password123', 'role': User.Roles.HR, 'first_name': 'Helen', 'last_name': 'Richards'},
        {'email': 'manager@cloudops.com', 'password': 'password123', 'role': User.Roles.MANAGER, 'first_name': 'Mike', 'last_name': 'Manager'},
        {'email': 'employee@cloudops.com', 'password': 'password123', 'role': User.Roles.EMPLOYEE, 'first_name': 'John', 'last_name': 'Doe'},
    ]

    dept, _ = Department.objects.get_or_create(name='IT', defaults={'description': 'Information Technology'})

    for data in users_data:
        email = data['email']
        if not User.objects.filter(email=email).exists():
            print(f"Creating user: {email}")
            user = User.objects.create_user(
                username=email,
                email=email,
                password=data['password'],
                role=data['role'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            
            # Create Employee profile for everyone except maybe Pure Admin, but system seems to expect it for some features
            # Let's add it for everyone to be safe for now, or at least Manager/Employee
            if data['role'] != User.Roles.ADMIN:
                if not hasattr(user, 'employee_profile'):
                    Employee.objects.create(
                        user=user,
                        department=dept,
                        designation='Staff',
                        joining_date=date.today(),
                        phone_number='1234567890'
                    )
        else:
            print(f"User already exists: {email}")
            # Ensure password is set if it exists
            u = User.objects.get(email=email)
            u.set_password(data['password'])
            u.save()

if __name__ == '__main__':
    create_users()
    print("Test users setup complete.")
