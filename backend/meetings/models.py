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

class Recording(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE, related_name='recording')
    file = models.FileField(upload_to='recordings/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Recording for {self.meeting.title}"

class Transcript(models.Model):
    recording = models.OneToOneField(Recording, on_delete=models.CASCADE, related_name='transcript')
    content = models.TextField()
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transcript for {self.recording.meeting.title}"

class ActionItem(models.Model):
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='action_items')
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    # Optional: Link to a system Task if converted
    task = models.OneToOneField('tasks.Task', on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_action_item')

    def __str__(self):
        return self.description

