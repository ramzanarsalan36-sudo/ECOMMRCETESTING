import http.server
import socketserver
import socket
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Clean logging
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def get_ips():
    ips = []
    try:
        # Get all local IP addresses
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127.") and not ip.startswith("169.254"):
                ips.append(ip)
    except Exception:
        pass
    if not ips:
        ips = ["192.168.1.8", "192.168.1.200"]
    return ips

if __name__ == '__main__':
    with ThreadingServer(("0.0.0.0", PORT), Handler) as httpd:
        local_ips = get_ips()
        print("============================================================")
        print("  [*] HOPEKRAFT E-COMMERCE FRONTEND SERVER RUNNING!")
        print("============================================================")
        print(f"  > Local (Your PC):     http://localhost:{PORT}/")
        print(f"  > Local (Your PC):     http://127.0.0.1:{PORT}/")
        for ip in local_ips:
            print(f"  > Network (Client/Phone): http://{ip}:{PORT}/")
        print("-" * 60)
        print(f"  > Home Page:           http://localhost:{PORT}/index.html")
        print(f"  > Product Page:        http://localhost:{PORT}/product.html")
        print("=" * 60)
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
