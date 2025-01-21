from django.contrib import admin
from django.utils.html import format_html
from django.utils.timezone import now
from django.http import HttpResponse
from .models import CustomUser, UploadedFile, SharedFile
import os


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Role & MFA', {'fields': ('role', 'mfa_secret')}),
    )


class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'user', 'encrypted', 'uploaded_at', 'download_link')
    list_filter = ('encrypted', 'uploaded_at')
    search_fields = ('file_name', 'user__username')
    ordering = ('uploaded_at',)

    def download_link(self, obj):
        return format_html(
            '<a href="{}" download>Download</a>', obj.file.url
        )
    download_link.short_description = 'Download File'


class SharedFileAdmin(admin.ModelAdmin):
    list_display = ('file', 'shared_with', 'owner', 'view_permission', 'download_permission', 'expiration_time', 'is_valid')
    list_filter = ('view_permission', 'download_permission', 'expiration_time')
    search_fields = ('file__file_name', 'shared_with__username', 'owner__username')
    ordering = ('expiration_time',)

    def is_valid(self, obj):
        return obj.is_access_allowed()
    is_valid.boolean = True
    is_valid.short_description = 'Access Allowed'


# Register the models with the admin site
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UploadedFile, UploadedFileAdmin)
admin.site.register(SharedFile, SharedFileAdmin)
