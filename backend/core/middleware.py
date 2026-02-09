import threading

_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response



    def __call__(self, request):
        _thread_locals.user = request.user
        response = self.get_response(request)
        return response


class SessionSecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for unauthenticated users
        if not request.user.is_authenticated:
            return self.get_response(request)

        current_ip = request.META.get('REMOTE_ADDR')
        # Handle proxy headers if deployed (e.g., X-Forwarded-For)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            current_ip = x_forwarded_for.split(',')[0]

        session_ip = request.session.get('user_ip')

        if not session_ip:
            # First request in session, bind IP
            request.session['user_ip'] = current_ip
        elif session_ip != current_ip:
            # IP Mismatch - Possible Hijack
            request.session.flush() # Logout
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("Session IP Mismatch. Please login again.")

        return self.get_response(request)


