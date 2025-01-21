from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
import pyotp

class CustomUser(AbstractUser):
    """
    Custom User model with roles, MFA, email verification, and password reset support.
    """
    USER_ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('guest', 'Guest'),
    )
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES, default='guest')
    mfa_secret = models.CharField(max_length=16, default=pyotp.random_base32)
    email_verification_code = models.CharField(max_length=64, blank=True, null=True)
    email_verification_expiry = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=64, blank=True, null=True)
    password_reset_expiry = models.DateTimeField(blank=True, null=True)
    def __str__(self):
        return self.username
    

class UploadedFile(models.Model):
    """
    Model to handle uploaded files with optional encryption.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(upload_to='uploaded_files/')
    file_name = models.CharField(max_length=255)
    encrypted = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} uploaded by {self.user.username}"

class SharedFile(models.Model):
    """
    Model to manage file sharing between users with permissions and time restrictions.
    """
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='shared_files')
    shared_with = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='shared_files')
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='owned_files')
    view_permission = models.BooleanField(default=False)
    download_permission = models.BooleanField(default=False)
    share_link = models.CharField(max_length=512, blank=True, null=True)
    expiration_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Shared {self.file.file_name} with {self.shared_with.username}"

    def is_access_allowed(self):
        """
        Check if the shared link is still valid based on the expiration time.
        """
        return self.expiration_time is None or now() < self.expiration_time
