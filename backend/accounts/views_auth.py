import logging
import smtplib
from secrets import token_urlsafe
from django.utils.timezone import now, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from google.oauth2 import id_token
from google.auth.transport import requests
from .models import CustomUser
from django.http.response import HttpResponse
logger = logging.getLogger(__name__)

# Generate tokens for user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Google Authentication
@api_view(['POST'])
def google_auth_view(request):
    google_id_token = request.data.get('token')
    if not google_id_token:
        return Response({"error": "Missing Google token."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        id_info = id_token.verify_oauth2_token(
            google_id_token,
            requests.Request(),
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError:
        return Response({"error": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

    email = id_info.get("email")
    if not email:
        return Response({"error": "Email not found in Google token."}, status=status.HTTP_400_BAD_REQUEST)

    user, created = CustomUser.objects.get_or_create(email=email)
    if created:
        user.username = email.split('@')[0]
        user.is_active = True
        user.save()

    tokens = get_tokens_for_user(user)
    return Response(tokens, status=status.HTTP_200_OK)

# User Registration
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        role = request.data.get("role", "user")

        if not username or not password or not email:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ['user', 'guest']:
            return Response({"error": "Invalid role provided."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(username=username).exists() or CustomUser.objects.filter(email=email).exists():
            return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        verification_token = token_urlsafe(32)
        expiration_time = now() + timedelta(hours=24)

        user = CustomUser.objects.create(
            username=username,
            email=email,
            role=role,
            is_active=False,
            email_verification_code=verification_token,
            email_verification_expiry=expiration_time
        )
        user.set_password(password)
        user.save()

        verification_link = f"{settings.BACKEND_URL}/api/verify-email/?token={verification_token}"
        send_mail(
            "Verify Your Email",
            f"Click the link to verify your email: {verification_link}",
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        return Response({"message": "Verification email sent."}, status=status.HTTP_201_CREATED)

# Email Verification
class VerifyLinkView(APIView):
    def get(self, request):
        token = request.query_params.get("token")
        user = CustomUser.objects.filter(email_verification_code=token).first()

        if not user or now() > user.email_verification_expiry:
            return HttpResponse("Invalid or expired token.", status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.email_verification_code = None
        user.email_verification_expiry = None
        user.save()
        return HttpResponse("Email verified successfully. Now you can log in.", status=status.HTTP_200_OK)
    

# Login with JWT
class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user and user.is_active:
            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials or inactive account."}, status=status.HTTP_401_UNAUTHORIZED)

# Logout by blacklisting refresh token
@api_view(['POST'])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if refresh_token:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
    return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

# Reset Password
class ResetPasswordRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = CustomUser.objects.filter(email=email).first()

        if user:
            reset_token = token_urlsafe(32)
            user.password_reset_token = reset_token
            user.password_reset_expiry = now() + timedelta(hours=24)
            user.save()

            reset_link = "{settings.BACKEND_URL}/reset-password/?token={reset_token}"
            send_mail(
                "Reset Password",
                f"Click here to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email]
            )
        return Response({"message": "If the email exists, a reset link will be sent."}, status=status.HTTP_200_OK)

class ResetPasswordConfirmView(APIView):
    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        user = CustomUser.objects.filter(password_reset_token=token).first()
        if user and now() <= user.password_reset_expiry:
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_expiry = None
            user.save()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
