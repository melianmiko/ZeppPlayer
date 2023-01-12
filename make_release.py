import json
import shutil
import os
import sys
import subprocess

from zipfile import ZipFile, ZIP_DEFLATED
from tarfile import TarFile
from pathlib import Path


def get_version():
	fn = "package.json"
	with open(fn, "r") as f:
		data = json.loads(f.read())
		return data['version']


def main():
	if sys.platform == "win32":
		make_win32()
	elif sys.platform == "linux":
		make_linux()
	elif sys.platform == "darwin":
		make_darwin()
	else:
		print("OS not supported")


def make_linux():
	if os.path.isdir("dist"):
		shutil.rmtree("dist")

	subprocess.Popen(["npm", "run", "build"]).wait()

	for cache in Path("zp_server").rglob("__pycache__"):
		shutil.rmtree(cache)

	os.mkdir("dist")
	with TarFile.open(f"dist/ZeppPlayer_v{get_version()}_linux.tar.gz", "x:gz") as tar:
		tar.add("package.json")
		tar.add("package-lock.json")
		tar.add("start.sh")
		for dirname in ["app", "projects/demo", "zp_server"]:
			tar.add(dirname, recursive=True)


def make_darwin():
	if os.path.isdir("dist"):
		shutil.rmtree("dist")

	subprocess.Popen(["npm", "run", "build"]).wait()
	subprocess.Popen(["pyinstaller", 'ZeppPlayer.osx.spec']).wait()

	with TarFile.open(f"dist/ZeppPlayer_v{get_version()}_macos.tar.gz", "x:gz") as tar:
		tar.add("dist/ZeppPlayer.app", recursive=True)


def make_win32():
	if os.path.isdir("dist"):
		shutil.rmtree("dist")

	spec_file = "ZeppPlayer.win32.spec"
	dist_file = "ZeppPlayer.exe"
	subprocess.Popen(["npm.cmd", "run", "build"]).wait()
	subprocess.Popen(["pyinstaller.exe", spec_file]).wait()

	with ZipFile(f"dist/ZeppPlayer_v{get_version()}_win32.zip", "w", ZIP_DEFLATED) as zip:
		zip.write("package.json")
		zip.write("package-lock.json")
		zip.write(f"dist/{dist_file}", dist_file)
		for dirname in ["app", "projects/demo"]:
			p = Path(dirname)
			for f in p.rglob("**/*"):
				fn = str(f)[len(str(p))+1:]
				zip.write(str(f), dirname + "/" + fn)


main()
