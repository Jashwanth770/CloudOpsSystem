from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet

router = DefaultRouter()
# Analytics is a ViewSet but we are using custom actions, so we register it as a ViewSet
# However, since it doesn't expose standard CRUD, we only need the actions.
# DefaultRouter handles @action decorators fine.
router.register(r'', AnalyticsViewSet, basename='analytics')

urlpatterns = router.urls
