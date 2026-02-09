from rest_framework import serializers
from .models import ApprovalRequest

class ApprovalRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.first_name')
    approver_name = serializers.ReadOnlyField(source='approver.first_name')
    
    class Meta:
        model = ApprovalRequest
        fields = '__all__'
        read_only_fields = ('requester', 'status', 'created_at', 'updated_at')
