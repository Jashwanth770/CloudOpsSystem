import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from employees.models import Department

departments = [
    "Administration",
    "Human Resources",
    "Management",
    "Engineering",
    "Finance",
    "Operations",
    "Sales",
    "Marketing",
    "Customer Support"
]

for name in departments:
    obj, created = Department.objects.get_or_create(name=name)
    if created:
        print(f"Created: {name}")
    else:
        print(f"Exists: {name}")
