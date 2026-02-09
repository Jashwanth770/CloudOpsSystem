import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.models import Notification

User = get_user_model()

def run_verification():
    print("--- Starting Notification System Verification ---")
    
    # 1. Setup User
    email = "notify_test@example.com"
    password = "password123"
    
    if User.objects.filter(email=email).exists():
        User.objects.filter(email=email).delete()
    
    user = User.objects.create_user(username="notify_test", email=email, password=password, first_name="Notify", last_name="Tester")
    print(f"✅ Created User: {email}")

    # 2. Create Notifications
    Notification.objects.create(recipient=user, title="Welcome", message="Welcome to the system!", link="/dashboard")
    Notification.objects.create(recipient=user, title="Task Assigned", message="You have a new task.", link="/tasks/1")
    print("✅ Created 2 test notifications.")

    # 3. Test API
    client = APIClient()
    client.force_authenticate(user=user)

    # List
    print("\n[Step 1] Fetching Notifications...")
    response = client.get('/api/notifications/')
    if response.status_code == 200:
        data = response.json()
        print(f"DEBUG: API Response Data: {data}")
        
        results = data.get('results', data) # Handle paginated or list response
        if isinstance(results, list):
            print(f"✅ Fetched {len(results)} notifications.")
            if len(results) == 2:
                print("   Count matches.")
            else:
                print(f"❌ Count mismatch: Expected 2, got {len(results)}")
        else:
             print(f"❌ Unexpected response format: {type(results)}")
    else:
        print(f"❌ Failed to fetch: {response.status_code}")

    # Unread Count
    print("\n[Step 2] Checking Unread Count...")
    response = client.get('/api/notifications/unread_count/')
    if response.status_code == 200:
        count = response.json()['count']
        print(f"✅ Unread Count: {count}")
        if count == 2:
            print("   Count matches.")
        else:
            print(f"❌ Count mismatch: Expected 2, got {count}")

    # Mark Read
    print("\n[Step 3] Marking first notification as read...")
    notif_id = Notification.objects.filter(recipient=user).first().id
    response = client.post(f'/api/notifications/{notif_id}/mark_read/')
    if response.status_code == 200:
        print("✅ Marked as read.")
    else:
        print(f"❌ Failed to mark read: {response.status_code}")

    # Verify Count Decreased
    print("\n[Step 4] Verifying Unread Count Decreased...")
    response = client.get('/api/notifications/unread_count/')
    if response.status_code == 200:
        count = response.json()['count']
        print(f"✅ New Unread Count: {count}")
        if count == 1:
            print("   Count matches (decreased by 1).")
        else:
            print(f"❌ Count mismatch: Expected 1, got {count}")

    print("\n--- Verification Complete ---")

if __name__ == '__main__':
    run_verification()
