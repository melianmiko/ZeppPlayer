import json
import logging
import subprocess
import sys

import bottle
import waitress

import tk_tools, user_config
import watcher
from server_data import ROOT_DIR, PORT, HTML_TEMPLATE, PROJECTS_DIR

log = logging.getLogger("ZPServer")


@tk_tools.async_with_ui("WebServer")
def start():
    waitress.serve(bottle.default_app(), listen=f"127.0.0.1:{PORT}", threads=6)


@bottle.route("/api/open_projects")
def open_projects():
    subprocess.Popen(["open", str(PROJECTS_DIR)])
    return "true"


@bottle.route("/api/watch/<project:path>")
def set_watch(project):
    if not (PROJECTS_DIR / project).is_dir():
        log.info(f"No dir {PROJECTS_DIR / project}")
        return ""
    watcher.set_directory(PROJECTS_DIR / project)
    return ""


@bottle.route("/api/change_count")
def get_watch():
    return str(watcher.GlobalState.changes_counter)


@bottle.route("/projects")
def list_projects_legacy():
    out = ""

    for file in sorted(PROJECTS_DIR.iterdir()):
        if not file.is_dir():
            continue
        if not (file / "app.json").is_file():
            continue
        out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"

    return HTML_TEMPLATE.replace("{}", out)


@bottle.route("/projects/<filename:path>")
def project_file(filename):
    path = PROJECTS_DIR / filename
    if path.is_dir():
        """deprecated"""
        out = ""
        for file in path.iterdir():
            if file.is_dir():
                out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"
            else:
                out += f"<a href=\"{file.name}\">{file.name}</a>\n"
        return HTML_TEMPLATE.replace("{}", out)

    return with_headers(bottle.static_file(filename, PROJECTS_DIR))


@bottle.route("/")
def hello():
    return with_headers(bottle.static_file('index.html', ROOT_DIR / "app"))


@bottle.route("/package.json")
def package_json():
    if sys.platform == "darwin" and user_config.get_prop("check_updates", True):
        # Unlock old update checker for OSX
        with open(ROOT_DIR / "package.json", "r") as f:
            data = json.loads(f.read())
        data["_legacyUpdateChecker"] = True
        bottle.response.content_type = "application/json"
        return json.dumps(data)

    return with_headers(bottle.static_file('package.json', ROOT_DIR))


def with_headers(resp):
    resp.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
    return resp


@bottle.route("/app/<filename:path>")
def app_file(filename):
    return with_headers(bottle.static_file(filename, ROOT_DIR / "app"))


@bottle.hook("after_request")
def after():
    bottle.response.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
