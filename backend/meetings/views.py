from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Meeting, Recording, Transcript, ActionItem
from .serializers import MeetingSerializer, RecordingSerializer, ActionItemSerializer
from .ai_utils import transcribe_audio, analyze_meeting
from tasks.models import Task
import os

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

class RecordingUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        if 'file' not in request.data:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        recording, created = Recording.objects.get_or_create(meeting=meeting)
        recording.file = request.data['file']
        recording.save()
        
        serializer = RecordingSerializer(recording)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProcessMeetingView(APIView):
    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        try:
            recording = meeting.recording
        except Recording.DoesNotExist:
            return Response({"error": "No recording found for this meeting"}, status=status.HTTP_404_NOT_FOUND)
            
        if not recording.file:
            return Response({"error": "Recording file is missing"}, status=status.HTTP_400_BAD_REQUEST)
            
        # 1. Transcribe
        transcript_text = transcribe_audio(recording.file.path)
        if not transcript_text:
             return Response({"error": "Transcription failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             
        # 2. Save Transcript
        transcript, _ = Transcript.objects.get_or_create(recording=recording)
        transcript.content = transcript_text
        transcript.save()
        
        # 3. Analyze
        analysis = analyze_meeting(transcript_text)
        if analysis:
            transcript.summary = analysis.get('summary', '')
            transcript.save()
            
            # 4. Save Action Items
            for item in analysis.get('action_items', []):
                ActionItem.objects.create(transcript=transcript, description=item)
                
        recording.processed = True
        recording.save()
        
        return Response({"message": "Meeting processed successfully"}, status=status.HTTP_200_OK)

class ConvertActionItemToTaskView(APIView):
    def post(self, request, action_item_id):
        action_item = get_object_or_404(ActionItem, id=action_item_id)
        
        if action_item.task:
            return Response({"error": "Action item already converted to task"}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data
        assigned_to_id = data.get('assigned_to')
        
        if not assigned_to_id:
            return Response({"error": "assigned_to is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not request.user.is_authenticated:
             return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        from employees.models import Employee
        assigned_to = get_object_or_404(Employee, id=assigned_to_id)

        task = Task.objects.create(
            title=f"Task from Meeting: {action_item.description[:50]}...",
            description=action_item.description,
            assigned_to=assigned_to,
            assigned_by=request.user,
            due_date=data.get('due_date'), # Expecting YYYY-MM-DD
            priority=data.get('priority', 'MEDIUM'),
            status='TODO'
        )
        
        # Link Task to Action Item
        action_item.task = task
        action_item.save()
        
        return Response({"message": "Task created", "task_id": task.id}, status=status.HTTP_201_CREATED)
