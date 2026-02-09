from rest_framework import serializers
from .models import Document
from users.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'uploaded_by', 'department', 'department_name', 'description', 'created_at']
        read_only_fields = ['uploaded_by', 'department']
