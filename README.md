# ☁️ CloudOps System

**Enterprise-Grade Employee Management & Operations Platform**

CloudOps is a comprehensive, secure, and scalable web application designed to streamline modern enterprise operations. From payroll processing to real-time video conferencing, CloudOps unifies essential business tools into a single, intuitive dashboard.

---

## 🚀 Key Features

### 🔐 Security & Access Control
*   **Role-Based Access Control (RBAC)**: Granular permissions for Admins, HR, Managers, and Employees.
*   **Two-Factor Authentication (2FA)**: Secure login via Authenticator App, Email, or Mock SMS.
*   **Audit Logs**: Comprehensive tracking of all system actions for compliance and security.
*   **Data Encryption**: Sensitive employee data (Salary, Bank Info) is encrypted at rest using AES-256.

### 👥 HR & Employee Management
*   **Employee Directory**: Detailed profiles with search and filtering capabilities.
*   **Attendance Tracking**: Check-in/Check-out system with geolocation support.
*   **Leave Management**: Workflow-based leave requests and approvals.
*   **Auto-ID Generation**: Automatic assignment of professional Employee IDs (e.g., EMP-001).

### 💰 Finance & Payroll
*   **Payroll Processing**: Automated salary calculation including tax and deductions.
*   **Payslip Generation**: Employees can view and download monthly payslips.
*   **Expense Claims**: Submit, review, and approve expense reimbursements with receipt uploads.

### 🤝 Collaboration & Productivity
*   **Video Conferencing**: Built-in Jitsi Meet integration for secure team meetings.
*   **Internal Messaging**: Real-time chat system with attachments and read receipts.
*   **Task Management**: Assign, track, and complete tasks with priority levels.
*   **Document Management**: Secure file storage with department-level isolation.

### 📊 Analytics & Insights
*   **Role-Based Dashboards**: Customized views for Executives, Managers, and Staff.
*   **Real-Time Data**: Live updates for attendance, leave balances, and pending tasks.

---

## 🛠️ Technology Stack

**Frontend**
*   **React + Vite**: Blazing fast UI development.
*   **Tailwind CSS**: Modern utility-first styling.
*   **Framer Motion**: Smooth, professional animations.
*   **Recharts**: Interactive data visualization.

**Backend**
*   **Django REST Framework**: Robust and secure API development.
*   **PostgreSQL**: Reliable relational database (Production).
*   **Redis**: Caching and session management.
*   **Celery**: Asynchronous task processing (Email, Notifications).

**DevOps & Deployment**
*   **Docker**: Containerized environment for consistency.
*   **GitHub Actions**: CI/CD pipeline for automated testing and deployment.
*   **Render & Vercel**: Scalable cloud hosting architecture.

---

## ⚡ Getting Started (Local Development)

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL (Optional, defaults to SQLite for dev)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CloudOpsSystem.git
cd CloudOpsSystem
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
*The API will be available at `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The Application will be available at `http://localhost:5173`*

---

## 🌍 Deployment

### Deployment Architecture
*   **Frontend**: Deployed on **Vercel** / **Netlify**.
*   **Backend**: Deployed on **Render** / **Railway** / **Heroku**.
*   **Database**: PostgreSQL hosted on the cloud.

### Quick Deploy (Docker)
Ensure you have Docker and Docker Compose installed.
```bash
docker-compose up --build -d
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support
For support, email support@cloudops.com or join our Slack channel.

---

*Built with ❤️ by the CloudOps Team*
