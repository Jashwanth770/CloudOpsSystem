import filetype
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .services import VirusScanner

# Try to import dictionary for magic, but don't fail if system lib is missing
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False

def validate_file_type(upload):
    # 1. Virus Scan
    if not VirusScanner.scan(upload):
        raise ValidationError(_("File contains a virus or malware."))

    # 2. Magic Number Validation
    # Read snippet to detect type
    initial_pos = upload.tell()
    upload.seek(0)
    first_bytes = upload.read(2048)
    upload.seek(initial_pos)

    # Try detecting with filetype (pure python, safer dependency) first
    kind = filetype.guess(first_bytes)
    mime_type = kind.mime if kind else None

    # Fallback to python-magic if usually more robust but requires system libs
    if not mime_type and MAGIC_AVAILABLE:
        try:
            mime_type = magic.from_buffer(first_bytes, mime=True)
        except Exception:
            pass # Ignore magic errors

    if not mime_type:
         raise ValidationError(_("Could not determine file type."))

    allowed_mimes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', # docx
        'application/msword', # doc
        'image/jpeg',
        'image/png',
        'text/plain'
    ]

    if mime_type not in allowed_mimes:
        raise ValidationError(f"Unsupported file type: {mime_type}. Allowed: PDF, DOCX, JPG, PNG, TXT.")
