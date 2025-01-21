from django.urls import path
from .views import *  # Make sure views are correctly imported
from .views_auth import *

urlpatterns = [
    # Authentication
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/verify-email/', VerifyLinkView.as_view(), name='verify_email'),
    path('api/google-login/', google_auth_view, name='google_login'),

    # Password Reset
    path('api/reset-password/', ResetPasswordRequestView.as_view(), name='reset_password_request'),
    path('api/reset-password-confirm/', ResetPasswordConfirmView.as_view(), name='reset_password_confirm'),
    
    #get user details
    path('api/user-details/', get_user_details, name='get_user_details'),

    # File Operations
    path('api/upload/', upload_file, name='upload_file'),
    path('api/share/<str:encrypted_file_id>/', share_file, name='share_file'),
    path('api/access/<str:encrypted_file_id>/', access_shared_file, name='access_shared_file'),
    path('api/revoke/<str:encrypted_file_id>/', revoke_access, name='revoke_access'),
    path('api/current-access-files/', get_current_access_files, name='get_current_access_files'),
    path('api/view/<str:encrypted_file_id>/', view_file, name='view_file'),

    # Additional Endpoints
    path('api/all-files/', get_all_uploaded_files, name='get_all_uploaded_files'),
    path('api/shared-with/<str:encrypted_file_id>/', get_shared_users, name='get_shared_users'),
    path('api/update-permission/<str:encrypted_file_id>/', update_permission, name='update_permission'),
]
