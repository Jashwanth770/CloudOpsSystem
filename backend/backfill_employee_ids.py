import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from employees.models import Employee

print("\n--- Backfilling Employee IDs ---")

employees = Employee.objects.all().order_by('id')
count = 0

for emp in employees:
    if not emp.employee_id:
        # Generate ID based on ID sequence or count
        # To strictly follow order: EMP-{id} padding
        # But we want sequential looking IDs depending on hire order (which is usually ID order)
        
        # Check if ID exists (just in case)
        new_id = f"EMP-{emp.id:04d}"
        
        if Employee.objects.filter(employee_id=new_id).exists():
             # Fallback if conflict (unlikely with ID base)
             new_id = f"EMP-{emp.id:04d}-B"

        emp.employee_id = new_id
        emp.save()
        print(f"Updated {emp.user.email} -> {new_id}")
        count += 1
    else:
        print(f"Skipping {emp.user.email} (Already has ID: {emp.employee_id})")

print(f"\nSuccessfully backfilled {count} employees.")
