from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        custom_data = {
            "status": "error",
            "code": response.status_code,
            "message": "An error occurred",
            "errors": response.data
        }
        
        # Try to make the message more specific if possible
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, list):
                custom_data['message'] = exc.detail[0]
            elif isinstance(exc.detail, dict):
                 if 'message' in exc.detail and isinstance(exc.detail['message'], list) and exc.detail['message']:
                     custom_data['message'] = str(exc.detail['message'][0])
                 else:
                     custom_data['message'] = "Validation error"
            else:
                 custom_data['message'] = str(exc.detail)

        response.data = custom_data

    return response
