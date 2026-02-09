from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from users.models import User
from tasks.models import Task
from leaves.models import Leave
from attendance.models import Attendance
from users.permissions import IsAdminOrHR, IsManager

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrHR | IsManager]

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        Aggregated summary for Dashboards (Role-Based).
        Matches the structure expected by frontend.
        """
        user = request.user
        
        # 1. Tasks Stats
        pending_tasks = Task.objects.filter(status='PENDING').count()
        completed_tasks = Task.objects.filter(status='COMPLETED').count()
        high_priority = Task.objects.filter(priority='HIGH', status='PENDING').count()
        
        # 2. Attendance (Today)
        today = timezone.now().date()
        attendance_today = Attendance.objects.filter(date=today, status='PRESENT').count()
        total_employees = User.objects.filter(role='EMPLOYEE').count()
        attendance_percentage = (attendance_today / total_employees * 100) if total_employees > 0 else 0
        
        # 3. Leaves
        leaves_pending = Leave.objects.filter(status='PENDING').count()
        leaves_approved = Leave.objects.filter(status='APPROVED').count()
        
        # 4. Finance (Mock/Real)
        pending_expenses = 0 
        # try:
        #     from finance.models import ExpenseClaim
        #     pending_expenses = ExpenseClaim.objects.filter(status='PENDING').count()
        # except:
        #     pass

        return Response({
            "pendingTasks": pending_tasks,
            "completedTasks": completed_tasks,
            "highPriorityTasks": high_priority,
            "attendancePercentage": round(attendance_percentage, 1),
            "activeEmployees": attendance_today,
            "totalEmployees": total_employees,
            "leavesPending": leaves_pending,
            "leavesApproved": leaves_approved,
            "pendingApprovals": leaves_pending + pending_expenses, # Approx
            "teamSize": total_employees, # Simplify for now
            "pendingExpenses": pending_expenses
        })

    @action(detail=False, methods=['get'])
    def attendance_trends(self, request):
        """
        Last 7 days attendance count.
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        trends = Attendance.objects.filter(
            date__range=[start_date, end_date], 
            status='PRESENT'
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return Response(trends)

    @action(detail=False, methods=['get'])
    def task_performance(self, request):
        """
        Task completion rates by employee (Top 5).
        """
        performance = Task.objects.filter(status='COMPLETED').values(
            'assigned_to__user__first_name', 'assigned_to__user__last_name'
        ).annotate(
            completed_count=Count('id')
        ).order_by('-completed_count')[:5]
        
        return Response(performance)
