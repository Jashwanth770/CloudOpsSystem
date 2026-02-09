from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserProfileView, CustomTokenObtainPairView, ChangePasswordView, UserListView
from .views_2fa import Setup2FAView, Verify2FAView, Disable2FAView, SendOTPView, Update2FAConfigView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/send-otp/', SendOTPView.as_view(), name='send_otp'), # New Endpoint
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # 2FA Endpoints
    path('2fa/setup/', Setup2FAView.as_view(), name='2fa_setup'),
    path('2fa/verify/', Verify2FAView.as_view(), name='2fa_verify'),
    path('2fa/disable/', Disable2FAView.as_view(), name='2fa_disable'),
    path('2fa/update-config/', Update2FAConfigView.as_view(), name='2fa_update_config'),
]
