from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return notifications for the current user, newest first
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['POST'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user."""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def unread_count(self, request):
        """Return the count of unread notifications."""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)
