from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from employees.models import Employee

User = get_user_model()

class Task(TimeStampedModel):
    assigned_to = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        BLOCKED = 'BLOCKED', 'Blocked'

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)

    def __str__(self):
        return self.title
