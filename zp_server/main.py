import logging
import os
import sys
import webbrowser

if sys.stdout is None:
    # Fix bottle crash when windowed
    from io import StringIO
    sys.stdout = StringIO()
    sys.stderr = StringIO()

import requests
from PIL import Image

import tk_tools
import updater
from server_data import HTML_TEMPLATE, LINK_SRC, LINK_WEB, PORT, ROOT_DIR
from bottle import response

import bottle


logging.basicConfig(level=logging.DEBUG)


# noinspection PyUnresolvedReferences,PyProtectedMember
def main():
    if is_running():
        return webbrowser.open(f"http://127.0.0.1:{PORT}")

    # Linux pystray backend force
    if sys.platform == "linux":
        os.environ["PYSTRAY_BACKEND"] = "gtk"

    # Tray menu
    import pystray
    main_menu = pystray.Menu(
        pystray.MenuItem('Open Chrome',
                         lambda: webbrowser.open(f"http://127.0.0.1:{PORT}"),
                         default=True),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem('Website', lambda: webbrowser.open(LINK_WEB)),
        pystray.MenuItem('Source code', lambda: webbrowser.open(LINK_SRC)),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem(f"ver. {updater.get_self_version()}", None, enabled=False),
        pystray.MenuItem("Exit", lambda: os._exit(0))
    )

    applet = pystray.Icon("Zepp PLayer",
                          icon=Image.open(ROOT_DIR / "app" / "icon.png"),
                          menu=main_menu)

    # Run server
    run_webserver()
    webbrowser.open(f"http://127.0.0.1:{PORT}")

    if sys.platform != "darwin":
        updater.run()

    applet.run()


def is_running():
    try:
        resp = requests.get(f"http://127.0.0.1:3195/app/icon.png")
        assert resp.status_code == 200
        return True
    except Exception:
        return False


@tk_tools.async_with_ui("WebServer")
def run_webserver():
    print("Run server...")
    bottle.run(host='127.0.0.1', port=PORT)


@bottle.route("/projects")
def list_projects_legacy():
    root = ROOT_DIR / "projects"
    out = ""

    for file in root.iterdir():
        if not file.is_dir():
            continue
        if not (file / "app.json").is_file():
            continue
        out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"

    return HTML_TEMPLATE.replace("{}", out)


@bottle.route("/projects/<filename:path>")
def project_file(filename):
    path = ROOT_DIR / "projects" / filename
    if path.is_dir():
        """deprecated"""
        out = ""
        for file in path.iterdir():
            if file.is_dir():
                out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"
            else:
                out += f"<a href=\"{file.name}\">{file.name}</a>\n"
        return HTML_TEMPLATE.replace("{}", out)

    return bottle.static_file(filename, ROOT_DIR / "projects")


@bottle.route("/")
def hello():
    return bottle.static_file('index.html', ROOT_DIR / "app")


@bottle.route("/package.json")
def hello():
    return bottle.static_file('package.json', ROOT_DIR)


@bottle.route("/app/<filename:path>")
def app_file(filename):
    return bottle.static_file(filename, ROOT_DIR / "app")


@bottle.hook("after_request")
def after():
    response.set_header("Cache-Control", "no-cache, no-store, must-revalidate")


if __name__ == "__main__":
    main()
