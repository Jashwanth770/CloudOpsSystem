import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from employees.models import Employee

User = get_user_model()
NEW_EMAIL = 'admin@cloudops.com'
OLD_ADMIN_EMAIL = 'admin@cloudops.com'

try:
    # 1. Get the new user
    new_admin = User.objects.filter(email=NEW_EMAIL).first()
    
    if new_admin:
        print(f"Found existing user: {new_admin.email} (Role: {new_admin.role})")
        
        # 2. Delete existing Employee profile if it exists (Admins usually don't have one, or it might conflict)
        # Check if we should keep it? implementing plan says admin, usually admins in this system might not need employee profile
        # but let's just upgrade user first.
        
        # 3. Update User to ADMIN
        new_admin.role = 'ADMIN'
        new_admin.is_staff = True
        new_admin.is_superuser = True
        new_admin.save()
        print(f"Promoted {NEW_EMAIL} to ADMIN and Superuser.")
        
        # 4. Handle old admin
        old_admin = User.objects.filter(email=OLD_ADMIN_EMAIL).first()
        if old_admin:
            print(f"Deleting old admin: {old_admin.email}")
            old_admin.delete()
        else:
             print(f"Old admin {OLD_ADMIN_EMAIL} not found (maybe already deleted or renamed).")

    else:
        print(f"User {NEW_EMAIL} not found. Please create it or check spelling.")

except Exception as e:
    print(f"An error occurred: {e}")
