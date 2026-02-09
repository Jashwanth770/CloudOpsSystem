from django.db import models
from django.conf import settings
import uuid

class Meeting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meetings')
    title = models.CharField(max_length=255)
    room_id = models.CharField(max_length=100, unique=True, help_text="Unique Jitsi Room Name")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    daily_url = models.URLField(blank=True, null=True, help_text="Daily.co Room URL")

    def save(self, *args, **kwargs):
        if not self.room_id:
            # Generate a secure random room ID if not provided
            self.room_id = f"{uuid.uuid4()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.room_id})"
