import logging
from pathlib import Path

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

log = logging.getLogger("Watcher")


class GlobalState:
    observer = None     # type: Observer|None
    changes_counter = 0


def _handle():
    log.info("Project changed!")
    GlobalState.changes_counter += 1


class ChangeHandler(FileSystemEventHandler):
    def on_moved(self, event):
        _handle()

    def on_modified(self, event):
        _handle()

    def on_created(self, event):
        _handle()

    def on_deleted(self, event):
        _handle()


def set_directory(path: Path):
    log.info(f"Set-up observer for {path}")
    if GlobalState.observer is not None:
        GlobalState.observer.stop()
        GlobalState.observer.join()

    observer = Observer()
    handler = ChangeHandler()
    if (path / "assets").is_dir():
        observer.schedule(handler, str(path / "assets"), recursive=True)
    if (path / "watchface").is_dir():
        observer.schedule(handler, str(path / "watchface"), recursive=True)
    if (path / "page").is_dir():
        observer.schedule(handler, str(path / "page"), recursive=True)
    observer.start()

    GlobalState.observer = observer
    GlobalState.changes_counter = 0
