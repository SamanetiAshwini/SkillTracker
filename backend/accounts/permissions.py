from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """
    Allows access only to authenticated students.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsMentor(permissions.BasePermission):
    """
    Allows access only to authenticated mentors.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'MENTOR'
        )


class IsPlatformAdmin(permissions.BasePermission):
    """
    Allows access only to administrative users (Role == ADMIN or staff/superuser).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class IsMentorOrAdmin(permissions.BasePermission):
    """
    Allows access to mentors or administrators.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['MENTOR', 'ADMIN'] or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to edit/view it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return True
        if hasattr(obj, 'student'):
            return obj.student == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
