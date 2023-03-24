import logging
from pathlib import Path

from watchdog.observers import Observer

log = logging.getLogger("Watcher")


class GlobalState:
    observer = None     # type: Observer|None
    changes_counter = 0


class _Handler:
    @staticmethod
    def dispatch(e):
        GlobalState.changes_counter += 1


def set_directory(path: Path):
    log.info(f"Set-up observer for {path}")
    if GlobalState.observer is not None:
        GlobalState.observer.stop()
        GlobalState.observer.join()

    observer = Observer()
    if (path / "assets").is_dir():
        observer.schedule(_Handler, str(path / "assets"), recursive=True)
    if (path / "watchface").is_dir():
        observer.schedule(_Handler, str(path / "watchface"), recursive=True)
    if (path / "page").is_dir():
        observer.schedule(_Handler, str(path / "page"), recursive=True)
    observer.start()

    GlobalState.observer = observer
    GlobalState.changes_counter = 0
