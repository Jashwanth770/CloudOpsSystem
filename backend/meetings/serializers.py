from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source='host.get_full_name', read_only=True)
    
    class Meta:
        model = Meeting
        fields = ['id', 'host', 'host_name', 'title', 'room_id', 'created_at', 'is_active', 'daily_url']
        read_only_fields = ['id', 'host', 'room_id', 'created_at']
