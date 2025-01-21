# Use a lightweight Python base image
FROM python:3.10-slim

# Set environment variables for Django
ENV PYTHONDONTWRITEBYTECODE 1  # Prevent Python from writing .pyc files
ENV PYTHONUNBUFFERED 1         # Ensure stdout/stderr logs are unbuffered

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (optional but commonly needed)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port for Django
EXPOSE 8000

# Run migrations and start the development server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
