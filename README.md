<<<<<<< HEAD

# File Share Application Deployment

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
![WhatsApp Image 2025-01-22 at 01 02 49_8b1914a1](https://github.com/user-attachments/assets/5ee350e6-9b41-4d86-89e9-8b75041ac71a)
![WhatsApp Image 2025-01-22 at 01 03 05_dc0a27e7](https://github.com/user-attachments/assets/66a93df1-6615-4913-b465-754ab444b503)
![WhatsApp Image 2025-01-22 at 01 03 39_1d20df29](https://github.com/user-attachments/assets/5dbd6de9-e297-4ca8-a1d1-8254b5cae715)
![image](https://github.com/user-attachments/assets/f96e82a7-9e6a-485c-a068-cce32e25b0a0)
![image](https://github.com/user-attachments/assets/30fbeb26-89f2-4bb2-8b9e-592786b59696)
![image](https://github.com/user-attachments/assets/e9fa3377-3a54-46e3-9b08-e0a3329271ed)
![image](https://github.com/user-attachments/assets/9f44f8aa-213f-4cba-b6f7-682aa1fd028b)
![image](https://github.com/user-attachments/assets/feb49262-0446-4c3b-88a1-399392300632)
![image](https://github.com/user-attachments/assets/112fb152-189a-45c3-b536-622c0fe49241)







=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> dcd2a51 (GIT)
