from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Default queryset is the INBOX (messages received by user)
        that are not archived.
        """
        user = self.request.user
        return Message.objects.filter(recipient=user, is_archived=False)

    def perform_create(self, serializer):
        # Save the message first
        message = serializer.save(sender=self.request.user)
        
        # If external email, send via SMTP
        if message.recipient_email:
            from django.core.mail import send_mail
            try:
                send_mail(
                    subject=message.subject,
                    message=message.body,
                    from_email=self.request.user.email, # Or settings.DEFAULT_FROM_EMAIL
                    recipient_list=[message.recipient_email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log error but don't crash the request? Or return warning?
                print(f"Failed to send email: {e}")
                # Optional: Update message body to indicate failure or status

    @action(detail=False, methods=['get'])
    def sent(self, request):
        """
        Return messages sent by the current user.
        """
        user = request.user
        messages = Message.objects.filter(sender=user, is_archived=False)
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serialized = self.get_serializer(messages, many=True)
        return Response(serialized.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.recipient != request.user:
             return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        message.is_read = True
        message.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Message.objects.filter(recipient=request.user, is_read=False, is_archived=False).count()
        return Response({'count': count})
