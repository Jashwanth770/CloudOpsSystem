import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print(f"{'Email':<30} {'Role':<10} {'Active':<10} {'Password Set'}")
print("-" * 65)
for u in User.objects.all():
    print(f"{u.email:<30} {u.role:<10} {str(u.is_active):<10} {u.has_usable_password()}")
