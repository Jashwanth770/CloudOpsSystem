import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from tasks.models import Task
from employees.models import Employee
from rest_framework.test import APIClient

User = get_user_model()

def test_delete():
    # 1. Setup Admin User
    admin_email = "admin_test_delete@cloudops.com"
    if not User.objects.filter(email=admin_email).exists():
        admin = User.objects.create_superuser(
            username="admin_test_delete",
            email=admin_email,
            password="password123",
            role='ADMIN' # Using the legacy role causing issues?
        )
    else:
        admin = User.objects.get(email=admin_email)
        admin.role = 'ADMIN'
        admin.save()
        
    # 2. Setup Manager/Employee for assignment
    emp_user = User.objects.filter(email="emp_test@cloudops.com").first()
    if not emp_user:
        emp_user = User.objects.create_user(username="emp_test", email="emp_test@cloudops.com", password="password", role="SOFTWARE_ENGINEER")
        
    employee, _ = Employee.objects.get_or_create(user=emp_user, defaults={'employee_id': 'E999', 'department': 'Engineering', 'designation': 'Dev'})

    # 3. Create Task
    task = Task.objects.create(
        title="Task to Delete",
        description="Should go away",
        assigned_to=employee,
        assigned_by=admin,
        due_date="2026-01-01 12:00:00" # Dummy date
    )
    task_id = task.id
    print(f"Created Task {task_id}")

    # 4. Try Delete via Client
    client = APIClient()
    client.force_authenticate(user=admin)
    
    response = client.delete(f'/api/tasks/{task_id}/')
    print(f"Delete Response: {response.status_code}")
    
    # 5. Verify
    if Task.objects.filter(id=task_id).exists():
        print("FAIL: Task still exists in DB")
    else:
        print("SUCCESS: Task deleted from DB")

if __name__ == "__main__":
    try:
        test_delete()
    except Exception as e:
        print(f"Error: {e}")
