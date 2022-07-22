import http.server
import socketserver
import os
import pystray
import threading
import webbrowser

from PIL import Image

PORT = 3000
HTTPD = None

if getattr(sys, 'frozen', False):
    DIRECTORY = os.path.dirname(sys.executable)
elif __file__:
    DIRECTORY = os.path.dirname(__file__)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)



def do_open_chrome():
    webbrowser.open("http://127.0.0.1:3000")


def do_exit():
    os._exit(0)


def run_server():
    global HTTPD

    HTTPD = socketserver.TCPServer(("", PORT), Handler)

    print("serving at port", PORT)
    HTTPD.serve_forever()


def main():
    icon = Image.open(DIRECTORY + "/app/icon.png")

    applet = pystray.Icon('Zepp-Player', icon=icon, menu=pystray.Menu(
        pystray.MenuItem('Open Chrome', do_open_chrome),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Exit", do_exit)
    ))

    threading.Thread(target=run_server).start()

    do_open_chrome()
    applet.run()


if __name__ == "__main__":
    main()
