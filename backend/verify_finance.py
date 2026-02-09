import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from employees.models import Employee, Department
from finance.models import SalaryStructure, Payslip, ExpenseClaim
from datetime import date

User = get_user_model()

def run_verification():
    print("--- Starting Finance Module Verification ---")
    
    # 1. Setup Users (Admin/Accountant, Employee)
    # Clear previous
    User.objects.filter(email__in=["accountant@example.com", "emp_fin@example.com"]).delete()
    
    # Accountant
    accountant = User.objects.create_user(
        username="accountant", email="accountant@example.com", password="password123", 
        first_name="Alice", last_name="Accountant", role='ACCOUNTANT'
    )
    
    # Employee
    emp_user = User.objects.create_user(
        username="emp_fin", email="emp_fin@example.com", password="password123", 
        first_name="Bob", last_name="Builder", role='SOFTWARE_ENGINEER'
    )
    dept = Department.objects.first() or Department.objects.create(name="Engineering")
    employee = Employee.objects.create(
        user=emp_user, department=dept, designation="Engineer", 
        joining_date=date.today(), salary=50000
    )
    print("✅ Created Users: Accountant and Employee (Bob)")

    client = APIClient()

    # 2. Salary Structure (Accountant Access)
    print("\n[Step 1] Creating Salary Structure (Accountant)...")
    client.force_authenticate(user=accountant)
    salary_data = {
        "employee": employee.id,
        "basic_salary": 30000,
        "hra": 15000,
        "allowances": 5000,
        "deductions": 2000
    }
    response = client.post('/api/finance/salary-structures/', salary_data)
    if response.status_code == 201:
        print(f"✅ Created Salary Structure. Net Salary: {response.data['net_salary']}")
    else:
        print(f"❌ Failed to create Salary Structure: {response.status_code} - {response.data}")

    # 3. Expense Claim (Employee)
    print("\n[Step 2] Creating Expense Claim (Employee)...")
    client.force_authenticate(user=emp_user)
    claim_data = {
        "title": "Travel to Site",
        "amount": 150.50,
        "category": "TRAVEL"
    }
    response = client.post('/api/finance/expenses/', claim_data)
    if response.status_code == 201:
        claim_id = response.data['id']
        print(f"✅ Created Expense Claim #{claim_id}")
    else:
        print(f"❌ Failed to create claim: {response.status_code} - {response.data}")

    # 4. Approve Expense (Accountant)
    print("\n[Step 3] Approving Expense (Accountant)...")
    client.force_authenticate(user=accountant)
    # Check permission logic later (Manager vs Accountant). 
    # For now accountant permissions to approve? ViewSet allows IsManager | IsAccountant
    response = client.post(f'/api/finance/expenses/{claim_id}/approve/')
    if response.status_code == 200:
        print("✅ Expense Approved.")
    else:
        print(f"❌ Failed to approve: {response.status_code} - {response.data}")

    print("\n--- Verification Complete ---")

if __name__ == '__main__':
    run_verification()
