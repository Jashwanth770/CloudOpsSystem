import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

print(f"{'Name':<25} | {'Role':<20} | {'User ID':<8} | {'Emp PK':<8} | {'Email':<30}")
print("-" * 110)

for user in User.objects.all().order_by('role'):
    emp_pk = "N/A"
    if hasattr(user, 'employee_profile'):
        emp_pk = user.employee_profile.id
    
    print(f"{user.get_full_name():<25} | {user.role:<20} | {str(user.id):<8} | {str(emp_pk):<8} | {user.email:<30}")

print("\n")
