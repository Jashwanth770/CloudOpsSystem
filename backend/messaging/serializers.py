from rest_framework import serializers
from .models import Message, MessageAttachment
from users.serializers import UserSerializer

class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ['id', 'file', 'uploaded_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    recipient_details = UserSerializer(source='recipient', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    uploads = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_details', 'recipient', 'recipient_email', 'recipient_details', 'subject', 'body', 'is_read', 'timestamp', 'parent', 'attachments', 'uploads']
        read_only_fields = ['sender', 'timestamp']

    def create(self, validated_data):
        uploads = validated_data.pop('uploads', [])
        validated_data['sender'] = self.context['request'].user
        message = super().create(validated_data)
        
        for file in uploads:
            MessageAttachment.objects.create(message=message, file=file)
            
        return message
