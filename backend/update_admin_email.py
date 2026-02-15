import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
NEW_EMAIL = 'admin@cloudops.com'

try:
    # Try to find the existing admin by role
    admin_user = User.objects.filter(role='ADMIN').first()
    
    if not admin_user:
        # Fallback to finding by old email if role isn't enough/unique
        admin_user = User.objects.filter(email='admin@cloudops.com').first()

    if admin_user:
        print(f"Found admin user: {admin_user.email} (ID: {admin_user.id})")
        old_email = admin_user.email
        admin_user.email = NEW_EMAIL
        admin_user.username = NEW_EMAIL # Ensure username matches email
        admin_user.save()
        print(f"Successfully updated admin email from {old_email} to {NEW_EMAIL}")
    else:
        print("Admin user not found!")

except Exception as e:
    print(f"An error occurred: {e}")
