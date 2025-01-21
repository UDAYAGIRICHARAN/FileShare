import os
import ssl
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # Define the certificate and key paths
    cert_path = os.path.abspath("certs/server.crt")
    key_path = os.path.abspath("certs/server.key")

    # Ensure the certificates exist
    if not os.path.exists(cert_path) or not os.path.exists(key_path):
        raise FileNotFoundError("SSL certificate or key file not found.")

    # Configure the SSL context
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile=cert_path, keyfile=key_path)

    # Set Django settings module
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

    # Run the Django development server with HTTPS
    import socketserver
    from wsgiref.simple_server import make_server
    from django.core.wsgi import get_wsgi_application

    application = get_wsgi_application()
    with socketserver.TCPServer(("0.0.0.0", 443), application) as httpd:
        httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)
        print("Serving on https://0.0.0.0:443")
        httpd.serve_forever()
