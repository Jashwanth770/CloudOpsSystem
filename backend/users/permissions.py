from rest_framework import permissions
from .models import User

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to System Admin.
    """
    def has_permission(self, request, view):
        # Added 'ADMIN' string literal for legacy support
        return request.user and request.user.is_authenticated and (
            request.user.role in [User.Roles.SYSTEM_ADMIN, User.Roles.OFFICE_ADMIN] or 
            request.user.role == 'ADMIN'
        )

class IsHR(permissions.BasePermission):
    """
    Allows access to any HR role.
    """
    def has_permission(self, request, view):
        hr_roles = [
            User.Roles.HR_EXEC, User.Roles.HR_MANAGER, 
            User.Roles.RECRUITER, User.Roles.PAYROLL_OFFICER
        ]
        return request.user and request.user.is_authenticated and request.user.role in hr_roles

class IsManager(permissions.BasePermission):
    """
    Allows access to any Manager/Lead role.
    """
    def has_permission(self, request, view):
        manager_roles = [
            User.Roles.MANAGER, User.Roles.TEAM_LEAD, User.Roles.PROJECT_MANAGER, User.Roles.DEPT_HEAD,
            User.Roles.HR_MANAGER, User.Roles.FINANCE_MANAGER, User.Roles.OPERATIONS_MANAGER,
            User.Roles.SALES_MANAGER, User.Roles.MARKETING_MANAGER, User.Roles.SUPPORT_MANAGER,
            User.Roles.SYSTEM_ADMIN, 'ADMIN', User.Roles.OFFICE_ADMIN # Include Admins here too for safety
        ]
        return request.user and request.user.is_authenticated and request.user.role in manager_roles

class IsEmployee(permissions.BasePermission):
    """
    Allows access to any authenticated user (Base level).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsAdminOrHR(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsAdmin().has_permission(request, view) or IsHR().has_permission(request, view)

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        # Explicitly checking HR as well since HR often manages tasks
        return IsAdmin().has_permission(request, view) or IsManager().has_permission(request, view) or IsHR().has_permission(request, view)
