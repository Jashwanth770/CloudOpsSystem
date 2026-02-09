from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog, Notification
from tasks.models import Task
from workflows.models import ApprovalRequest

# List of models to track (can be expanded)
TRACKED_MODELS = ['Employee', 'Task', 'Leave', 'ApprovalRequest', 'User']

from .middleware import get_current_user

# ... Audit Log signals ...

@receiver(post_save, sender=Task)
def notify_task_assignment(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        Notification.objects.create(
            recipient=instance.assigned_to.user,
            title="New Task Assigned",
            message=f"You have been assigned a new task: {instance.title}",
            link=f"/tasks/{instance.id}"
        )

@receiver(post_save, sender=ApprovalRequest)
def notify_approval_update(sender, instance, created, **kwargs):
    if created:
        # Notify Approver
        if instance.approver:
             Notification.objects.create(
                recipient=instance.approver,
                title="Approval Needed",
                message=f"{instance.requester} requesting approval.",
                link=f"/approvals/{instance.id}" # Assumption: frontend route
            )
    else:
        # Notify Requester of status change
        Notification.objects.create(
            recipient=instance.requester,
            title=f"Request {instance.status}",
            message=f"Your request has been {instance.status}.",
            link=f"/approvals/{instance.id}"
        )


@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    if sender.__name__ not in TRACKED_MODELS:
        return

    action = 'CREATE' if created else 'UPDATE'
    user = get_current_user()
    
    # Ensure user is authenticated instance
    if user and not user.is_authenticated:
        user = None
    
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        details=f"Saved {sender.__name__} {instance.pk}"
    )

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender.__name__ not in TRACKED_MODELS:
        return

    user = get_current_user()
     # Ensure user is authenticated instance
    if user and not user.is_authenticated:
        user = None
    
    AuditLog.objects.create(
        user=user,
        action='DELETE',
        model_name=sender.__name__,
        object_id=str(instance.pk),
        details=f"Deleted {sender.__name__} {instance.pk}"
    )
