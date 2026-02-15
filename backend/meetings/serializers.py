from rest_framework import serializers
from .models import Meeting, Recording, Transcript, ActionItem

class MeetingSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source='host.get_full_name', read_only=True)
    
    class Meta:
        model = Meeting
        fields = ['id', 'host', 'host_name', 'title', 'room_id', 'created_at', 'is_active', 'daily_url']
        read_only_fields = ['id', 'host', 'room_id', 'created_at']

class ActionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItem
        fields = ['id', 'description', 'created_at', 'task']
        read_only_fields = ['id', 'created_at']

class TranscriptSerializer(serializers.ModelSerializer):
    action_items = ActionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Transcript
        fields = ['id', 'content', 'summary', 'created_at', 'action_items']
        read_only_fields = ['id', 'created_at']

class RecordingSerializer(serializers.ModelSerializer):
    transcript = TranscriptSerializer(read_only=True)
    
    class Meta:
        model = Recording
        fields = ['id', 'meeting', 'file', 'uploaded_at', 'processed', 'transcript']
        read_only_fields = ['id', 'uploaded_at', 'processed', 'transcript']

