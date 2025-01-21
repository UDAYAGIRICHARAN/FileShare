from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now, timedelta
from .models import CustomUser, UploadedFile, SharedFile
from cryptography.fernet import Fernet
import logging
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import json
import os
import os
import Crypto
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import UploadedFile, SharedFile
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
# Setup logging


logger = logging.getLogger(__name__)

# Encryption key setup
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

@api_view(['GET'])
def get_user_details(request):
    """
    Returns the role and name of the logged-in user.
    """
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Unauthorized. Please log in."}, status=401)

        user_data = {
            "username": user.username,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}",
        }
        return JsonResponse(user_data, status=200)
    except Exception as e:
        logger.error(f"Error fetching user details: {str(e)}")
        return JsonResponse({"error": "Failed to fetch user details."}, status=500)
import os
import json
from base64 import b64decode
from django.http import JsonResponse
from rest_framework.decorators import api_view
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from .models import UploadedFile

# Utility function to validate hexadecimal strings
def is_hex(s):
    try:
        bytes.fromhex(s)
        return True
    except ValueError:
        return False
import os
import json
from base64 import b64decode
from django.http import JsonResponse
from rest_framework.decorators import api_view
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from .models import UploadedFile


from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view
from base64 import b64decode
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
import json

@api_view(['POST'])
def upload_file(request):
    try:
        data = request.data  # Use request.data instead of json.loads(request.body)
        file_name = data.get('file_name')
        encrypted_content_b64 = data.get('encrypted_content', '')
        aes_key_hex = data.get('aes_key', '')
        aes_iv_hex = data.get('aes_iv', '')

        if not all([file_name, encrypted_content_b64, aes_key_hex, aes_iv_hex]):
            return JsonResponse({"error": "Missing required fields."}, status=400)

        try:
            encrypted_content = b64decode(encrypted_content_b64)
            aes_key = bytes.fromhex(aes_key_hex)
            aes_iv = bytes.fromhex(aes_iv_hex)

            # Decrypt using AES in CBC mode with PKCS7 padding
            cipher = Cipher(algorithms.AES(aes_key), modes.CBC(aes_iv))
            decryptor = cipher.decryptor()
            decrypted_padded_content = decryptor.update(encrypted_content) + decryptor.finalize()

            # Remove padding after decryption
            unpadder = padding.PKCS7(128).unpadder()
            decrypted_content = unpadder.update(decrypted_padded_content) + unpadder.finalize()
        except Exception as e:
            return JsonResponse({"error": f"Decryption failed: {str(e)}"}, status=500)

        file_path = os.path.join('media', 'decrypted_files', file_name)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "wb") as file:
            file.write(decrypted_content)

        # Save the file metadata to the database
        uploaded_file = UploadedFile.objects.create(
            user=request.user,  # Ensure this is a valid `CustomUser` instance
            file_name=file_name,
            file=file_path,  # File field to store the decrypted file's path
            encrypted=False,  # Set encrypted to False since it’s now decrypted
        )


        return JsonResponse({"message": "File uploaded and decrypted successfully!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": f'An unexpected error occurred: {str(e)}'}, status=500)
# views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import os
import base64

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def access_shared_file(request, encrypted_file_id):
    """
    Endpoint to retrieve and encrypt a file for download.
    """
    try:
        # Assuming the encrypted_file_id is provided as a base64-encoded string.
        try:
            # Decode and convert the file ID
            file_id_bytes = base64.urlsafe_b64decode(encrypted_file_id + '==')
            file_id = int.from_bytes(file_id_bytes, 'big')
        except Exception:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)

        # Fetch the shared file and permissions
        shared_file = SharedFile.objects.filter(file_id=file_id).filter(
            Q(owner=request.user) |
            Q(shared_with=request.user, download_permission=True, expiration_time__gte=timezone.now())
        ).first()

        if not shared_file:
            return JsonResponse({"error": "You don't have permission to access this file."}, status=403)

        uploaded_file = shared_file.file  # Assuming `file` is a ForeignKey to `UploadedFile`

        # Get file path and file name
        uploaded_file_path = uploaded_file.file.path  # Use the `path` attribute
        uploaded_file_name = uploaded_file.file_name

        # Read the file content
        with open(uploaded_file_path, 'rb') as f:
            file_content = f.read()

        # Generate AES key and IV
        aes_key = os.urandom(32)  # 256-bit AES key
        aes_iv = os.urandom(16)   # 128-bit IV

        # Encrypt the file content using AES in CBC mode with PKCS7 padding
        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded_file_content = padder.update(file_content) + padder.finalize()

        cipher = Cipher(algorithms.AES(aes_key), modes.CBC(aes_iv), backend=default_backend())
        encryptor = cipher.encryptor()
        encrypted_content = encryptor.update(padded_file_content) + encryptor.finalize()

        # Encode the encrypted content, AES key, and IV in Base64
        encrypted_content_b64 = base64.b64encode(encrypted_content).decode('utf-8')
        aes_key_b64 = base64.b64encode(aes_key).decode('utf-8')
        aes_iv_b64 = base64.b64encode(aes_iv).decode('utf-8')

        # Return the encrypted content, key, IV, and file name
        return JsonResponse({
            "encrypted_content": encrypted_content_b64,
            "aes_key": aes_key_b64,
            "aes_iv": aes_iv_b64,
            "file_name": uploaded_file_name,
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def get_all_uploaded_files(request):
    """
    Returns a list of all files uploaded by the current user, including encrypted file IDs.
    """
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Unauthorized. Please log in."}, status=401)

        # Fetch all files uploaded by the user
        files = UploadedFile.objects.filter(user=user).values('id', 'file_name', 'uploaded_at')

        # Encrypt file IDs and construct response
        files_with_encryption = [
            {
                "encrypted_file_id": cipher_suite.encrypt(str(file["id"]).encode()).decode(),  # Encrypted ID
                "file_name": file["file_name"],
                "uploaded_at": file["uploaded_at"].isoformat(),  # Convert to ISO format for JSON compatibility
            }
            for file in files
        ]

        return JsonResponse({"files": files_with_encryption}, status=200)
    except Exception as e:
        logger.error(f"Failed to fetch uploaded files: {str(e)}")
        return JsonResponse({"error": "Failed to fetch files."}, status=500)


@api_view(['POST'])
def share_file(request, encrypted_file_id):
    """
    Share a file with another user, allowing configurable permissions and expiration time.
    """
    try:
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)
        # Validate the file to be shared
        file = get_object_or_404(UploadedFile, id=file_id, user=request.user)

        # Validate the target user for sharing
        username = request.data.get('user_id')
        if not username:
            return JsonResponse({"error": "Missing 'username' in request data."}, status=400)

        shared_with = get_object_or_404(CustomUser, username=username)

        # Parse and validate permissions
        view_permission = request.data.get('view_permission', False) in [True, 'true', 'True']
        download_permission = request.data.get('download_permission', False) in [True, 'true', 'True']
        expiration_hours = request.data.get('expiration', 24)

        try:
            expiration_hours = int(expiration_hours)
            expiration_time = now() + timedelta(hours=expiration_hours)
        except ValueError:
            return JsonResponse({"error": "Invalid 'expiration' value. Must be an integer."}, status=400)

        # Create or update the shared file record
        shared_file, created = SharedFile.objects.update_or_create(
            file=file,
            shared_with=shared_with,
            defaults={
                "owner": request.user,  # Set the owner to the current user
                "view_permission": view_permission,
                "download_permission": download_permission,
                "expiration_time": expiration_time,
            },
        )

        # Encrypt the file ID
        encrypted_file_id = cipher_suite.encrypt(str(file_id).encode()).decode()

        # Response indicating the sharing status
        return JsonResponse({
            "message": "File shared successfully.",
            "created": created,
            "shared_user": {
                "username": shared_with.username,
                "view_permission": shared_file.view_permission,
                "download_permission": shared_file.download_permission,
                "expiration": expiration_time.isoformat(),
                "encrypted_file_id": encrypted_file_id,  # Include encrypted file ID
            },
        })

    except UploadedFile.DoesNotExist:
        logger.error(f"File with id {file_id} not found or not owned by the user.")
        return JsonResponse({"error": "File not found or unauthorized."}, status=404)

    except CustomUser.DoesNotExist:
        logger.error(f"User with username '{username}' not found.")
        return JsonResponse({"error": f"User '{username}' not found."}, status=404)

    except Exception as e:
        logger.error(f"Unexpected error during file sharing: {e}")
        return JsonResponse({"error": "File sharing failed due to an unexpected error."}, status=500)
@api_view(['POST'])
def add_shared_user(request, encrypted_file_id):
    """
    Adds a new user to share the file with.
    """
    try:
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)
        file = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        shared_with_username = request.data.get('username')
        shared_with = get_object_or_404(CustomUser, username=shared_with_username)

        view_permission = request.data.get('view_permission', False) in ['true', 'True', True]
        download_permission = request.data.get('download_permission', False) in ['true', 'True', True]
        expiration_hours = int(request.data.get('expiration', 24))
        expiration_time = now() + timedelta(hours=expiration_hours)

        SharedFile.objects.update_or_create(
            file=file,
            shared_with=shared_with,
            defaults={
                "view_permission": view_permission,
                "download_permission": download_permission,
                "expiration_time": expiration_time,
            },
        )

        return JsonResponse({"message": f"User {shared_with.username} added successfully."})
    except Exception as e:
        logger.error(f"Error adding shared user: {str(e)}")
        return JsonResponse({"error": "Failed to add user for sharing."}, status=500)

@api_view(['GET'])
def view_file(request, encrypted_file_id):
    """
    View or download a file based on permissions.
    """
    try:
        # Decrypt the file ID
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)

        # Fetch the shared file record
        shared_file = get_object_or_404(SharedFile, file_id=file_id, shared_with=request.user)

        # Check if the user has view or download permissions
        if not shared_file.view_permission and not shared_file.download_permission:
            return JsonResponse({"error": "You do not have permission to access this file."}, status=403)

        # Read the file content
        file_obj = shared_file.file
        file_content = file_obj.file.read()  # Reading file content

        # If the user has view_permission, return the content for rendering
        if shared_file.view_permission:
            return JsonResponse({"file_content": file_content.decode('utf-8')}, status=200)

        # If the user has download_permission, return the file for download
        if shared_file.download_permission:
            response = HttpResponse(file_content, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_obj.file_name}"'
            return response

        # Default fallback (should not reach here due to earlier checks)
        return JsonResponse({"error": "Invalid access request."}, status=400)

    except Exception as e:
        logger.error(f"Error accessing file: {e}")
        return JsonResponse({"error": "Failed to access file."}, status=500)
@api_view(['GET'])
def get_shared_users(request, encrypted_file_id):
    try:
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)
        shared_files = SharedFile.objects.filter(file_id=file_id)
        shared_users = [
            {
                "user_id": sf.shared_with.id,
                "username": sf.shared_with.username,
                "email": sf.shared_with.email,
                "view_permission": sf.view_permission,
                "download_permission": sf.download_permission,
            }
            for sf in shared_files
        ]
        return JsonResponse({"shared_users": shared_users}, status=200)
    except Exception as e:
        logger.error(f"Error fetching shared users: {str(e)}")
        return JsonResponse({"error": "Failed to fetch shared users."}, status=500)
@api_view(['POST'])
def update_permission(request, encrypted_file_id):
    """
    Updates permissions (view/download) for a shared file based on the username.
    """
    try:
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)
        username = request.data.get("username")
        permission_type = request.data.get("permission_type")
        value = request.data.get("value", False) in ['true', 'True', True]

        # Ensure the username and file_id combination is unique
        shared_files = SharedFile.objects.filter(file_id=file_id, shared_with__username=username)

        if not shared_files.exists():
            return JsonResponse({"error": "No shared record found for this user and file."}, status=404)

        # Update permissions for all matching records
        for shared_file in shared_files:
            if permission_type == "view_permission":
                shared_file.view_permission = value
            elif permission_type == "download_permission":
                shared_file.download_permission = value
            shared_file.save()

        return JsonResponse({"message": "Permission updated successfully"})
    except Exception as e:
        logger.error(f"Error updating permission: {str(e)}")
        return JsonResponse({"error": "Failed to update permission."}, status=500)


@api_view(['POST'])
def revoke_access(request, encrypted_file_id):
    """
    Revokes access to a shared file for a specific username.
    """
    try:
        try:
            file_id = int(cipher_suite.decrypt(encrypted_file_id.encode()).decode())
        except Exception as e:
            return JsonResponse({"error": "Invalid or malformed file ID."}, status=400)
        username = request.data.get("username")

        # Find all shared records matching the file_id and username
        shared_files = SharedFile.objects.filter(file_id=file_id, shared_with__username=username)

        if not shared_files.exists():
            return JsonResponse({"error": "No shared record found for this user and file."}, status=404)

        # Delete all matching shared records
        shared_files.delete()
        return JsonResponse({"message": "Access revoked successfully"})
    except Exception as e:
        logger.error(f"Error revoking access: {str(e)}")
        return JsonResponse({"error": "Failed to revoke access."}, status=500)
@api_view(['GET'])
def get_current_access_files(request):
    """
    Returns a list of files the current user has access to, including encrypted file ID.
    """
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Unauthorized. Please log in."}, status=401)

        # Fetch shared files
        shared_files = SharedFile.objects.filter(shared_with=user).select_related('file', 'owner').values(
            "file__id", "file__file_name", "file__uploaded_at", "view_permission", "download_permission", "owner__username"
        )

        # Encrypt file IDs and transform data
        files = [
            {
                "encrypted_file_id": cipher_suite.encrypt(str(sf["file__id"]).encode()).decode(),  # Encrypted ID
                "file_name": sf["file__file_name"],  # Keep file_name in case it's needed internally
                "uploaded_at": sf["file__uploaded_at"],
                "view_permission": sf["view_permission"],
                "download_permission": sf["download_permission"],
                "shared_by": sf["owner__username"],
            }
            for sf in shared_files
        ]

        return JsonResponse({"files": files}, status=200)
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch accessible files. {str(e)}"}, status=500)