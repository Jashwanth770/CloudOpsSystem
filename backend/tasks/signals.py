from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Task

@receiver(post_save, sender=Task)
def send_task_notification(sender, instance, created, **kwargs):
    if created:
        subject = f"New Task Assigned: {instance.title}"
        assigner_role = instance.assigned_by.role.replace('_', ' ').title() if hasattr(instance.assigned_by, 'role') else 'Admin'
        
        message = f"""
        Hello {instance.assigned_to.user.first_name},

        You have been assigned a new task by {assigner_role}, {instance.assigned_by.get_full_name()}.

        Task: {instance.title}
        Priority: {instance.get_priority_display()}
        Due Date: {instance.due_date}

        Description:
        {instance.description}

        Please log in to the dashboard to view more details.
        """
        
        recipient_list = [instance.assigned_to.user.email]
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
        except Exception:
            pass
