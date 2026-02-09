import random
import logging
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

class OTPService:
    @staticmethod
    def generate_otp(user_id):
        # Generate 6 digit OTP
        otp = str(random.randint(100000, 999999))
        # Store in Redis/Cache for 5 minutes (300 seconds)
        key = f"otp_{user_id}"
        cache.set(key, otp, timeout=300)
        return otp

    @staticmethod
    def verify_otp(user_id, otp):
        key = f"otp_{user_id}"
        stored_otp = cache.get(key)
        if stored_otp and str(stored_otp) == str(otp):
            cache.delete(key) # Invalidate after use
            return True
        return False

    @staticmethod
    def send_email_otp(user, otp):
        subject = "Your Login OTP"
        message = f"Hello {user.first_name},\n\nYour OTP for login is: {otp}\n\nIt expires in 5 minutes."
        
        # ALWAYS Log OTP to console for Demo/Dev purposes
        print(f"\n 🔥 [DEMO MODE] OTP for {user.email}: {otp} 🔥 \n", flush=True)
        logger.info(f"📧 [DEMO MODE] OTP for {user.email}: {otp}")
        
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"📧 Email OTP sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send Email OTP: {e}")
            # In dev/demo, return True even if email fails so they can use the console code
            return True

    @staticmethod
    def send_sms_otp(user, otp):
        if not user.phone_number:
            logger.warning(f"⚠️ No phone number for user {user.username}")
            return False
        
        # Mock SMS Implementation
        logger.info(f"📱 [MOCK SMS] To {user.phone_number}: Your OTP is {otp}")
        return True
