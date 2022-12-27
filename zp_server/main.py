import json
import logging
import os
import subprocess
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
import user_config
import updater
from server_data import HTML_TEMPLATE, LINK_SRC, LINK_WEB, PORT, ROOT_DIR
from bottle import response

import bottle

logging.basicConfig(level=logging.DEBUG)


class State:
    applet = None


def main():
    if is_running():
        return webbrowser.open(f"http://127.0.0.1:{PORT}")

    # Linux pystray backend force
    if sys.platform == "linux":
        os.environ["PYSTRAY_BACKEND"] = "gtk"

    # Tray menu
    import pystray
    State.applet = pystray.Icon("ZeppPLayer",
                                icon=Image.open(ROOT_DIR / "app" / "icon.png"),
                                menu=build_menu())

    # Run server
    run_webserver()

    # Extras
    if user_config.get_prop("auto_browser", True):
        webbrowser.open(f"http://127.0.0.1:{PORT}")
    if sys.platform != "darwin" and user_config.get_prop("check_updates", True):
        updater.run()

    State.applet.run()


def build_menu():
    import pystray
    main_menu = pystray.Menu(
        pystray.MenuItem('Open Chrome',
                         lambda: webbrowser.open(f"http://127.0.0.1:{PORT}"),
                         default=True),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem('Website', lambda: webbrowser.open(LINK_WEB)),
        pystray.MenuItem('Source code', lambda: webbrowser.open(LINK_SRC)),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Check for updates", toggle_updater,
                         checked=lambda _: user_config.get_prop("check_updates", True)),
        pystray.MenuItem("Open browser on start", toggle_auto_browser,
                         checked=lambda _: user_config.get_prop("auto_browser", True)),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem(f"ver. {updater.get_self_version()}", None, enabled=False),
        pystray.MenuItem("Exit", do_exit)
    )
    return main_menu


def do_exit():
    # noinspection PyUnresolvedReferences,PyProtectedMember
    os._exit(0)


def toggle_updater():
    user_config.set_prop("check_updates", not user_config.get_prop("check_updates", True))


def toggle_auto_browser():
    user_config.set_prop("auto_browser", not user_config.get_prop("auto_browser", True))


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


@bottle.route("/api/open_projects")
def open_projects():
    subprocess.Popen(["open", str(ROOT_DIR / "projects")])
    return "true"


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
def package_json():
    if sys.platform == "darwin" and user_config.get_prop("check_updates", True):
        # Unlock old update checker for OSX
        with open(ROOT_DIR / "package.json", "r") as f:
            data = json.loads(f.read())
        data["_legacyUpdateChecker"] = True
        response.content_type = "application/json"
        return json.dumps(data)

    return bottle.static_file('package.json', ROOT_DIR)


@bottle.route("/app/<filename:path>")
def app_file(filename):
    return bottle.static_file(filename, ROOT_DIR / "app")


@bottle.hook("after_request")
def after():
    response.set_header("Cache-Control", "no-cache, no-store, must-revalidate")


if __name__ == "__main__":
    main()
