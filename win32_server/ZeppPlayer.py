# ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
# Copyright (C) 2022  MelianMiko

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import http.server
import socketserver
import os
import threading
import webbrowser
import sys

PORT = 3023
HTTPD = None

if getattr(sys, 'frozen', False):
    DIRECTORY = os.path.dirname(sys.executable)
elif __file__:
    DIRECTORY = os.path.dirname(__file__) + "/.."


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        return super().end_headers()


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
    import pystray_mod as pystray

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
    if sys.platform == 'linux':
        print("Run only server, without tray. Reson: linux")
        run_server()
        raise SystemExit
    main()
