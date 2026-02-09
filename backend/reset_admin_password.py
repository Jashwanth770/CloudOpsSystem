import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def reset_password():
    email = "jashwanthsai8630@gmail.com"
    try:
        u = User.objects.get(email=email)
        u.set_password("admin123")
        u.save()
        print(f"✅ Reset password for {email} to 'admin123'.")
    except User.DoesNotExist:
        print(f"❌ User {email} not found.")

if __name__ == '__main__':
    reset_password()
