from rest_framework import views, permissions, status
from rest_framework.response import Response
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import io
import base64
from .services import OTPService

class Setup2FAView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get or create unconfirmed device
        device, created = TOTPDevice.objects.get_or_create(user=user, confirmed=False)
        
        if not created and device.confirmed:
             return Response({"message": "2FA is already enabled."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate QR Code
        url = device.config_url
        qr = qrcode.make(url)
        img_buffer = io.BytesIO()
        qr.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return Response({
            "secret_key": device.key,
            "qr_code": f"data:image/png;base64,{img_str}",
            "config_url": url
        })

class Verify2FAView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get('otp')
        
        if not otp:
            return Response({"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the unconfirmed device
        device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
        
        if not device:
            # Check if already confirmed
            if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                 return Response({"message": "2FA is already enabled."}, status=status.HTTP_200_OK)
            return Response({"error": "No 2FA setup found. Please request setup first."}, status=status.HTTP_400_BAD_REQUEST)

        if device.verify_token(otp):
            device.confirmed = True
            device.save()
            return Response({"message": "2FA successfully enabled!"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

class Disable2FAView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password')
        
        if not user.check_password(password):
             return Response({"error": "Invalid password"}, status=status.HTTP_400_BAD_REQUEST)

        TOTPDevice.objects.filter(user=user).delete()
        return Response({"message": "2FA disabled successfully."}, status=status.HTTP_200_OK)

class SendOTPView(views.APIView):
    """
    Sends OTP via Email or SMS.
    """
    permission_classes = [permissions.AllowAny] # Allow login flow to request OTP

    def post(self, request):
        email = request.data.get('email')
        channel = request.data.get('channel', 'email') # 'email' or 'sms'

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal user existence
            return Response({"message": "If account exists, OTP sent."}, status=status.HTTP_200_OK)

        otp = OTPService.generate_otp(user.id)
        
        if channel == 'sms':
            OTPService.send_sms_otp(user, otp)
            msg = "OTP sent to your phone."
        else:
            OTPService.send_email_otp(user, otp)
            msg = "OTP sent to your email."

        return Response({"message": msg}, status=status.HTTP_200_OK)

class Update2FAConfigView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        auth_type = request.data.get('auth_type')
        
        if auth_type not in ['NONE', 'APP', 'EMAIL', 'SMS']:
            return Response({"error": "Invalid auth type."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify setup before switching
        if auth_type == 'APP':
            if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                 return Response({"error": "Please setup Authenticator App first."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save preference
        user.two_factor_auth_type = auth_type
        user.save()
        
        return Response({"message": f"2FA method updated to {auth_type}."}, status=status.HTTP_200_OK)
