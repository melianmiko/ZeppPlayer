import json
import shutil
import os
import sys
import subprocess

from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path

if sys.platform == "win32":
	spec_file = "ZeppPlayer.win32.spec"
	dist_file = "ZeppPlayer.exe"
else:
	spec_file = "ZeppPlayer.linux.spec"
	dist_file = "ZeppPlayer"


def get_version():
	fn = "package.json"
	with open(fn, "r") as f:
		data = json.loads(f.read())
		return data['version']


def main():
	if os.path.isdir("dist"):
		shutil.rmtree("dist")

	is_win32 = sys.platform == "win32"

	subprocess.Popen(["npm.cmd" if is_win32 else "npm", "run", "build"]).wait()
	subprocess.Popen(["pyinstaller.exe" if is_win32 else "pyinstaller", spec_file]).wait()

	with ZipFile(f"dist/ZeppPlayer_v{get_version()}.zip", "w", ZIP_DEFLATED) as zip:
		zip.write("package.json")
		zip.write("package-lock.json")
		zip.write(f"dist/{dist_file}", dist_file)
		for dirname in ["app", "projects/demo"]:
			p = Path(dirname)
			for f in p.rglob("**/*"):
				fn = str(f)[len(str(p))+1:]
				zip.write(str(f), dirname + "/" + fn)


main()
