import sys
import json
import shutil
import os
from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path


def get_version():
	fn = "package.json"
	with open(fn, "r") as f:
		data = json.loads(f.read())
		return data['version']


def main():
	if os.path.isdir("dist"):
		shutil.rmtree("dist")

	os.mkdir("dist")
	with ZipFile(f"dist/ZeppPlayer_v{get_version()}.zip", "w", ZIP_DEFLATED) as zip:
		zip.write("package.json")
		zip.write("package-lock.json")
		zip.write("index.html")
		zip.write("win32_server/dist/ZeppPlayer.exe", "ZeppPlayer.exe")
		for dirname in ["app", "projects/demo"]:
			p = Path(dirname)
			for f in p.rglob("**/*"):
				fn = str(f)[len(str(p))+1:]
				zip.write(str(f), dirname + "/" + fn)


main()
