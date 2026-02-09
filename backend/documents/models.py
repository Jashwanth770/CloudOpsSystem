import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from employees.models import Department
from core.validators import validate_file_type

User = get_user_model()

def document_upload_path(instance, filename):
    # Get extension
    ext = filename.split('.')[-1]
    # Generate random filename
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('documents/%Y/%m/%d/', filename)

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path, validators=[validate_file_type])
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='documents')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.department.name})"

    class Meta:
        ordering = ['-created_at']
