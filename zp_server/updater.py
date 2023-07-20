import json

from mmk_updater import UpdaterTool
from mmk_updater.ui_tkinter import TkinterUiMod

from zp_server import tk_tools
from zp_server.server_data import ROOT_DIR

URL = "https://st.mmk.pw/zepp_player/release.json"


def get_self_version():
    with open(ROOT_DIR / "package.json", "r", encoding="utf8") as f:
        data = json.loads(f.read())

    return data["version"]


def run():
    updater = UpdaterTool(URL, get_self_version(), UpdaterUiMod())
    updater.start()


class UpdaterUiMod(TkinterUiMod):
    def init_tk(self):
        return tk_tools.get_root()
