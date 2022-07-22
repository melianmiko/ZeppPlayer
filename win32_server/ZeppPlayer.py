import http.server
import socketserver
import os
import pystray_mod as pystray
import threading
import webbrowser
import sys

PORT = 3000
HTTPD = None

if getattr(sys, 'frozen', False):
    DIRECTORY = os.path.dirname(sys.executable)
elif __file__:
    DIRECTORY = os.path.dirname(__file__) + "/.."


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
    icon = DIRECTORY + "/app/icon.ico"
    assert os.path.isfile(icon)

    applet = pystray.Icon('Zepp-Player', icon=icon, menu=pystray.Menu(
        pystray.MenuItem('Open Chrome', do_open_chrome),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Exit", do_exit)
    ))

    threading.Thread(target=run_server).start()

    do_open_chrome()

    applet.notify(title="ZeppPlayer server is running",
                  message="You can stop them from system tray")

    applet.run()


if __name__ == "__main__":
    main()
