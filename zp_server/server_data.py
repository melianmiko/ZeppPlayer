import os
import sys

from pathlib import Path

ROOT_DIR = Path(os.getcwd())

if hasattr(sys, "frozen"):
    ROOT_DIR = Path(os.path.dirname(sys.executable))

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
