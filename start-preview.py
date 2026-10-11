from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser
os.chdir(Path(__file__).parent / "out")
print("Open http://localhost:8080 to view Zameen. Press Ctrl+C to stop.")
webbrowser.open("http://localhost:8080")
ThreadingHTTPServer(("127.0.0.1", 8080), SimpleHTTPRequestHandler).serve_forever()
