import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
emails = [
    'admin@cloudops.com',
    'hr@example.com',
    'manager@example.com',
    'employee@example.com',
    'bob@example.com'
]

print("--- Resetting Demo Users ---")
for email in emails:
    try:
        user = User.objects.get(email=email)
        user.set_password('password123')
        user.two_factor_auth_type = 'NONE'
        user.is_active = True
        user.save()
        print(f"✅ Reset password and disabled OTP for: {email}")
    except User.DoesNotExist:
        print(f"❌ User not found: {email}")

print("\nAll done!")
