import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import Attendance
from django.contrib.auth import get_user_model

User = get_user_model()

print("--- Debugging Attendance ---")
today = timezone.now().date()
print(f"Server Today (UTC date likely): {today}")

all_attendance = Attendance.objects.filter(date=today)
print(f"Total Attendance Records for {today}: {all_attendance.count()}")

for att in all_attendance:
    print(f"ID: {att.id} | User: {att.employee.user.email} | Date: {att.date} | In: {att.clock_in} | Out: {att.clock_out}")

# check for any users with employee profiles
users = User.objects.all()
for u in users:
    has_profile = hasattr(u, 'employee_profile')
    print(f"User: {u.email} | Role: {u.role} | Has Profile: {has_profile}")
    if has_profile:
        # Check if this user has attendance
        att = Attendance.objects.filter(employee=u.employee_profile, date=today).first()
        if att:
             print(f"  -> Found Attendance: {att}")
        else:
             print(f"  -> NO Attendance for today")
