import os
from pathlib import Path

ROOT_DIR = Path(os.getcwd())
LINK_WEB = "https://melianmiko.ru/en/zepp_player"
LINK_DOCS = "https://melianmiko.ru/en/zepp_player/install"
LINK_SRC = "https://notabug.org/melianmiko/ZeppPlayer"
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
