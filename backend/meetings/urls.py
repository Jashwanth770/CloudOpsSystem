from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet, RecordingUploadView, ProcessMeetingView, ConvertActionItemToTaskView

router = DefaultRouter()
router.register(r'', MeetingViewSet, basename='meetings')

urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:meeting_id>/upload_recording/', RecordingUploadView.as_view(), name='upload-recording'),
    path('<uuid:meeting_id>/process/', ProcessMeetingView.as_view(), name='process-meeting'),
    path('action_items/<int:action_item_id>/convert/', ConvertActionItemToTaskView.as_view(), name='convert-action-item'),
]
