import os
import sys

from pathlib import Path

ROOT_DIR = Path(os.getcwd())
if hasattr(sys, "frozen"):
    ROOT_DIR = Path(os.path.dirname(sys.executable))

if sys.platform == "win32":
    CONFIG_DIR = Path.home() / "AppData/Roaming/ZeppPLayer"
elif sys.platform == "darwin":
    CONFIG_DIR = Path.home() / "Library/Application Support/ZeppPLayer"
else:
    CONFIG_DIR = Path.home() / ".config/ZeppPLayer"

PROJECTS_DIR = ROOT_DIR / "projects"
if sys.platform == "darwin":
    PROJECTS_DIR = CONFIG_DIR / "projects"

LINK_WEB = "https://melianmiko.ru/en/zepp_player"
LINK_SRC = "https://github.com/melianmiko/ZeppPlayer"
PORT = 3195

HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
{}
</body>
</html>"""
