import json
import logging

from zp_server.server_data import CONFIG_DIR, PROJECTS_DIR
from tkinter import filedialog, messagebox

CONFIG_FILE = CONFIG_DIR / "zepp_player.json"
log = logging.getLogger("UserConfig")


class State:
    config = {}
    is_loaded = False


def get_prop(prop, fallback=None):
    if not State.is_loaded and CONFIG_FILE.is_file():
        _do_load()

    if prop in State.config:
        return State.config[prop]
    return fallback


def set_prop(prop, value):
    if not State.is_loaded and CONFIG_FILE.is_file():
        _do_load()

    log.info(f"Set {prop} = {value}")
    State.config[prop] = value
    with open(CONFIG_FILE, "w") as f:
        f.write(json.dumps(State.config))


def _do_load():
    try:
        with open(CONFIG_FILE, "r") as f:
            State.config = json.loads(f.read())
    except json.JSONDecodeError:
        pass
    State.is_loaded = True
