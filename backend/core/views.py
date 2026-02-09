from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for Cloud Load Balancers.
    Checks Database connectivity and App status.
    """
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "app": "running"
    }
    
    try:
        connection.ensure_connection()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = "disconnected"
        health_status["status"] = "unhealthy"
        health_status["error"] = str(e)
        return Response(health_status, status=503)
        
    return Response(health_status)
