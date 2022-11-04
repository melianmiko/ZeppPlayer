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

import os
import threading
import webbrowser
import sys

from twisted.web.server import Site
from twisted.web.static import File
from twisted.internet import reactor

PORT = 3195
LINK_WEB = "https://melianmiko.ru/en/zepp_player"
LINK_DOCS = "https://melianmiko.ru/en/zepp_player/install"
LINK_SRC = "https://notabug.org/melianmiko/ZeppPlayer"

if getattr(sys, 'frozen', False):
    DIRECTORY = os.path.dirname(sys.executable)
elif __file__:
    DIRECTORY = os.path.dirname(__file__) + "/.."


class DirectoryResource(File):
    def render_GET(self, request):
        request.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        return super().render_GET(request)


def do_open_chrome():
    webbrowser.open(f"http://127.0.0.1:{PORT}")


def do_exit():
    os._exit(0)


def run_server():
    factory = Site(DirectoryResource(DIRECTORY))
    reactor.listenTCP(PORT, factory)
    reactor.run()


def main():
    import pystray_mod as pystray

    icon = DIRECTORY + "/app/icon.ico"
    assert os.path.isfile(icon)

    applet = pystray.Icon('Zepp-Player', icon=icon, menu=pystray.Menu(
        pystray.MenuItem('Open Chrome', do_open_chrome),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem('Website', lambda: webbrowser.open(LINK_WEB)),
        pystray.MenuItem('Documentation', lambda: webbrowser.open(LINK_DOCS)),
        pystray.MenuItem('Source code', lambda: webbrowser.open(LINK_SRC)),
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
