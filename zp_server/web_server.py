import json
import logging
import subprocess
import sys
from pathlib import Path

import bottle
import waitress

from zp_server import watcher, user_config, tk_tools
from zp_server.server_data import ROOT_DIR, PORT, HTML_TEMPLATE, PROJECTS_DIR

log = logging.getLogger("ZPServer")


def _get_projects_dir():
    return Path(user_config.get_prop("projects_path", PROJECTS_DIR))


@tk_tools.async_with_ui("WebServer")
def start():
    waitress.serve(bottle.default_app(), listen=f"127.0.0.1:{PORT}", threads=6)


@bottle.route("/api/open_projects")
def open_projects():
    projects_dir = _get_projects_dir()
    subprocess.Popen(["open", str(projects_dir)])
    return "true"


@bottle.route("/api/watch/<project:path>")
def set_watch(project):
    projects_dir = _get_projects_dir()
    if not (projects_dir / project).is_dir():
        log.info(f"No dir {projects_dir / project}")
        return ""
    watcher.set_directory(projects_dir / project)
    return ""


@bottle.route("/api/change_count")
def get_watch():
    return str(watcher.GlobalState.changes_counter)


@bottle.get("/api/folder_chooser/")
@bottle.get("/api/folder_chooser/<path:path>")
def get_start_path(path=""):
    path = (Path.home() / path).resolve()

    items = []
    for item in path.iterdir():
        if item.is_dir():
            items.append(item.name)

    return {
        "current_path": str(path),
        "contents": items
    }


@bottle.get("/api/set_projects_dir/")
@bottle.get("/api/set_projects_dir/<path:path>")
def get_start_path(path=""):
    path = (Path.home() / path).resolve()
    assert path.is_dir()

    user_config.set_prop("projects_path", str(path))
    return "true"


@bottle.get("/api/list_projects")
def list_projects():
    projects_dir = _get_projects_dir()
    out = []

    prefer_build = bottle.request.query["preferBuildDir"] == "true"

    for entry in sorted(projects_dir.iterdir()):
        if not entry.is_dir():
            continue
        if not (entry / "app.json").is_file():
            continue

        load_url = f"/projects/{entry.name}"
        if prefer_build and (entry / "build" / "app.json").is_file():
            # ZMake build project fix
            load_url = f"/projects/{entry.name}/build"

        out.append({
            "title": entry.name,
            "url": load_url
        })

    return with_headers(bottle.Response(json.dumps(out)))


@bottle.route("/projects")
def list_projects_legacy():
    projects_dir = _get_projects_dir()
    print(projects_dir)
    out = ""

    for file in sorted(projects_dir.iterdir()):
        if not file.is_dir():
            continue
        if not (file / "app.json").is_file():
            continue
        out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"

    return HTML_TEMPLATE.replace("{}", out)


@bottle.route("/projects/<filename:path>")
def project_file(filename):
    projects_dir = _get_projects_dir()
    path = projects_dir / filename

    if path.is_dir():
        """deprecated"""
        out = ""
        for file in path.iterdir():
            if file.is_dir():
                out += f"<a href=\"{file.name}/\">{file.name}/</a>\n"
            else:
                out += f"<a href=\"{file.name}\">{file.name}</a>\n"
        return HTML_TEMPLATE.replace("{}", out)

    return with_headers(bottle.static_file(filename, projects_dir))


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
