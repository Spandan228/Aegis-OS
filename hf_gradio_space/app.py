import http.server
import socketserver
import os

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()

PORT = 7860
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"[*] Aegis OS 2.0 Command Center listening on port {PORT}...")
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    httpd.serve_forever()
