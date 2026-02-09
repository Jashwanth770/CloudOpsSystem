import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from employees.models import Department

count = Department.objects.count()
print(f"Department Count: {count}")

if count == 0:
    print("No departments found. Creating defaults...")
    Department.objects.create(name='Engineering', description='Software Development')
    Department.objects.create(name='HR', description='Human Resources')
    Department.objects.create(name='Sales', description='Sales and Marketing')
    Department.objects.create(name='Finance', description='Financial Operations')
    print("Defaults created.")
else:
    for d in Department.objects.all():
        print(f"- {d.name}")
