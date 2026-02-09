from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Meeting
from .serializers import MeetingSerializer

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'room_id'

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='validate/(?P<room_id>[^/.]+)')
    def validate_room(self, request, room_id=None):
        """
        Public endpoint to check if a room exists and is active.
        """
        try:
            # First check if the meeting exists at all
            meeting = Meeting.objects.get(room_id=room_id)
            
            if not meeting.is_active:
                return Response({
                    "valid": False, 
                    "reason": "ended",
                    "detail": "This meeting has ended."
                })

            return Response({
                "valid": True,
                "title": meeting.title,
                "host": meeting.host.get_full_name(),
                "is_host": request.user.is_authenticated and meeting.host == request.user,
                "room_id": meeting.room_id
            })
        except Meeting.DoesNotExist:
            return Response({
                "valid": False, 
                "reason": "not_found",
                "detail": "Meeting not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Meeting.DoesNotExist:
            return Response({"valid": False, "detail": "Meeting not found or expired"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def end_meeting(self, request, room_id=None):
        """
        End a meeting. Only the host can end it.
        """
        meeting = self.get_object()
        if meeting.host != request.user:
            return Response({"detail": "Only the host can end the meeting."}, status=status.HTTP_403_FORBIDDEN)
        
        meeting.is_active = False
        meeting.save()
        return Response({"detail": "Meeting ended successfully."})
