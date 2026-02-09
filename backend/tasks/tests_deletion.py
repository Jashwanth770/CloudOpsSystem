from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from tasks.models import Task
from employees.models import Employee, Department
from django.utils import timezone

User = get_user_model()

class TaskDeletionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Department
        self.department = Department.objects.create(name='Engineering', description='Tech stuff')

        # Admin User (Legacy Role)
        self.admin = User.objects.create_user(
            username='legacy_admin',
            email='admin@test.com',
            password='password123',
            role='ADMIN'
        )
        
        # Regular Manager
        self.manager = User.objects.create_user(
            username='manager',
            email='manager@test.com',
            password='password123',
            role='MANAGER'
        )
        
        # Regular Employee
        self.employee_user = User.objects.create_user(
            username='emp',
            email='emp@test.com',
            password='password123',
            role='SOFTWARE_ENGINEER'
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            department=self.department,
            designation='Dev',
            joining_date=timezone.now().date()
        )
        
        # Create Task
        self.task = Task.objects.create(
            title="Task 1",
            description="Desc",
            assigned_to=self.employee,
            assigned_by=self.manager,
            due_date=timezone.now()
        )

    def test_admin_can_delete_task(self):
        """Verify that a user with role='ADMIN' can delete a task."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/tasks/{self.task.id}/')
        
        print(f"\n[DEBUG] Admin Delete Response: {response.data if response.data else response.status_code}")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_manager_can_delete_task(self):
        """Verify that a manager can delete tasks."""
        # Re-create task for this test
        self.task = Task.objects.create(
            title="Task 2",
            description="Desc",
            assigned_to=self.employee,
            assigned_by=self.manager,
            due_date=timezone.now()
        )
        
        self.client.force_authenticate(user=self.manager)
        response = self.client.delete(f'/api/tasks/{self.task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())
