from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source='employee_profile.id', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'employee_id']
        read_only_fields = ['role', 'is_active', 'employee_id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

from django_otp.plugins.otp_totp.models import TOTPDevice

from .services import OTPService

from .services import OTPService
from django.db import models

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Standard authentication first
        data = super().validate(attrs)
        
        user = self.user
        otp = self.initial_data.get('otp')
        
        # Check configured 2FA type
        auth_type = user.two_factor_auth_type
        
        # 1. APP (Authenticator)
        if auth_type == 'APP':
            if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                if not otp:
                     raise serializers.ValidationError({"code": "2FA_REQUIRED", "message": "Authenticator code required."})
                
                device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
                if not device.verify_token(otp):
                     raise serializers.ValidationError({"code": "INVALID_OTP", "message": "Invalid authentication code."})
        
        # 2. EMAIL or SMS
        elif auth_type in ['EMAIL', 'SMS']:
            if otp:
                # Verify provided OTP
                if not OTPService.verify_otp(user.id, otp):
                    raise serializers.ValidationError({"code": "INVALID_OTP", "message": "Invalid authentication code."})
            else:
                # No OTP provided -> Auto-send and require it
                code = OTPService.generate_otp(user.id)
                msg = "2FA code required."
                
                if auth_type == 'SMS':
                    if OTPService.send_sms_otp(user, code):
                        msg = f"OTP sent to your phone ending in {user.phone_number[-4:] if user.phone_number else '****'}."
                else:
                    if OTPService.send_email_otp(user, code):
                        msg = f"OTP sent to {user.email}."
                
                raise serializers.ValidationError({"code": "2FA_REQUIRED", "message": msg})

        # Add custom claims
        data['role'] = user.role
        data['email'] = user.email
        data['full_name'] = user.get_full_name()
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def validate(self, attrs):
        if attrs['old_password'] == attrs['new_password']:
             raise serializers.ValidationError({"new_password": "New password must be different from old password."})
        return attrs
