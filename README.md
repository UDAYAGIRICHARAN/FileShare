
# Django-React Application Deployment

This guide covers the essential steps for deploying the Django-React application in a production environment using Docker and docker-compose.

## Overview

The application uses the following services:
- **Django**: Backend service running on Gunicorn.
- **React**: Frontend service built with ReactJS.
- **Nginx**: Web server and reverse proxy for Django and React applications.

## Prerequisites

Before proceeding, ensure you have Docker and Docker Compose installed on your deployment machine.

## Configuration

### Google OAuth Client ID

To integrate Google Sign-In into your application, you need to configure the Google Client ID:

1. Visit the [Google Developer Console](https://console.developers.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **Credentials**, and click on **Create Credentials** > **OAuth client ID**.
4. Select Web application, and add the authorized redirect URIs, which should be your production domain.
5. Copy the Client ID and add it to your Django settings under `GOOGLE_OAUTH2_CLIENT_ID`.

### SMTP Settings

To enable email functionalities such as account verification and password resets, configure your SMTP settings:

1. Navigate to your Django settings file (`settings.py`).
2. Update the following settings with your SMTP provider's details:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host'  # For example, 'smtp.gmail.com'
EMAIL_PORT = 587  # Typical port for SMTP
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-email-password'
```

Ensure these settings are secured and not exposed in your version control system.

### CORS Policy

For your Django backend to accept requests from your React frontend, configure CORS:

1. Install the `django-cors-headers` package via pip.
2. Add `corsheaders` to your `INSTALLED_APPS` in `settings.py`.
3. Add `CorsMiddleware` to your `MIDDLEWARE` classes, above all middleware classes other than Django’s `CommonMiddleware`.
4. Set `CORS_ALLOW_ALL_ORIGINS = True` or specify allowed origins with `CORS_ALLOWED_ORIGINS`.

### SSL Certificates

Secure your application by setting up SSL certificates:

1. Obtain SSL certificates from a trusted CA (Certificate Authority) or use Let's Encrypt for free certificates.
2. Place your certificates in the `./certs` directory.
3. Update your Nginx configuration to use SSL by modifying `nginx-django.conf` and `nginx-react.conf` to include SSL directives and point to your certificate files.

### Docker Compose Modifications

In `docker-compose.yml`, replace any development environment variables with your production secrets. Do **not** commit this file if it contains sensitive information. Instead, use environment variable files or a secrets management tool.

### Nginx Configuration

1. Place your SSL certificates in the `./certs` directory.
2. Ensure that your Nginx configuration files (`nginx-django.conf` and `nginx-react.conf`) are set up to handle HTTPS connections.
3. Update server names and other configurations specific to your production environment.

## Running the Application

To start the application, run the following command from the root directory of your project:

```bash
docker-compose up -d
```

This command will build the images if they are not already built and start the containers in detached mode.

## Maintenance

Regularly update your images with security patches by rebuilding them:

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Monitoring

Set up monitoring and logging for your application to track its health and performance. Tools like Prometheus, Grafana, and ELK stack are recommended for Docker environments.

For detailed steps and further configuration options, refer to the official Docker and Django documentation.
