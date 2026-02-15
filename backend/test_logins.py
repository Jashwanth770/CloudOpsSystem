import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.serializers import CustomTokenObtainPairSerializer

User = get_user_model()

def test_login(email, password):
    try:
        serializer = CustomTokenObtainPairSerializer(data={'email': email, 'password': password})
        if serializer.is_valid():
            print(f"✅ Login successful for {email}")
            return True
        else:
            print(f"❌ Login failed for {email}: {serializer.errors}")
            return False
    except Exception as e:
        print(f"💥 Error during login for {email}: {e}")
        return False

print("--- Testing Demo Logins ---")
test_login('hr@example.com', 'password123')
test_login('admin@cloudops.com', 'password123')
test_login('manager@example.com', 'password123')
