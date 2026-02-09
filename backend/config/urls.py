from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from core.views import health_check

schema_view = get_schema_view(
   openapi.Info(
      title="CloudOps System API",
      default_version='v1',
      description="API documentation for Internal Operations Management System",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/leaves/', include('leaves.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/workflows/', include('workflows.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/meetings/', include('meetings.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/messages/', include('messaging.urls')),
    path('api/notifications/', include('core.urls')),
    path('api/audit/', include('core.urls_audit')),
    path('api/health/', health_check),
    
    # Docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
