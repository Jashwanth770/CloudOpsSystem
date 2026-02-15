import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'admin@cloudops.com'

try:
    user = User.objects.get(email=email)
    user.set_password('password123')
    user.save()
    print(f"Successfully reset password for {email} to 'password123'")
except User.DoesNotExist:
    print(f"User {email} not found")
