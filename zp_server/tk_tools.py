import logging
import os
import threading
import tkinter
import traceback
from tkinter import ttk

import sv_ttk

from zp_server.high_dpi_tkinter import MakeTkDPIAware
from zp_server.server_data import ROOT_DIR


class Config:
    tk_root = None          # type: tkinter.Tk


def ui_thread(func):
    def _inner(*args):
        get_root().after_idle(func, *args)
    return _inner


def setup_window(window: tkinter.Toplevel):
    MakeTkDPIAware(window)
    window.iconphoto(False, tkinter.PhotoImage(file=ROOT_DIR / "app/icon.png"))


def get_root():
    def th():
        Config.tk_root = tkinter.Tk()
        Config.tk_root.withdraw()

        MakeTkDPIAware(Config.tk_root)
        sv_ttk.set_theme("light")

        complete.set()
        Config.tk_root.mainloop()
        Config.tk_root = None

    if Config.tk_root is None:
        complete = threading.Event()
        threading.Thread(target=th).start()
        complete.wait()

    return Config.tk_root


def stop_ui():
    if Config.tk_root is None:
        return

    @ui_thread
    def _int():
        Config.tk_root.destroy()
        Config.tk_root = None

    _int()


@ui_thread
def message(content, title, callback=None, parent=None):
    callback_used = threading.Event()
    root = tkinter.Toplevel(parent)
    root.wm_title(title)
    root.wm_resizable(False, False)

    setup_window(root)

    def _on_ok():
        if callback is not None:
            callback()
            callback_used.set()
        root.destroy()

    frame = ttk.Frame(root)
    frame.pack()

    ttk.Label(frame, text=content).pack(padx=16, pady=16)
    ttk.Button(frame, text="OK", style="Accent.TButton", command=_on_ok)\
        .pack(padx=16, pady=12, anchor=tkinter.NW)

    root.tk.eval(f'tk::PlaceWindow {str(root)} center')
    root.protocol("WM_DELETE_WINDOW", _on_ok)


def with_ui_exception(display_name):
    def _wrapper(func):
        # noinspection PyUnresolvedReferences,PyProtectedMember,PyBroadException
        def _internal(*args, **kwargs):
            try:
                func(*args, **kwargs)
            except Exception:
                exc_text = traceback.format_exc()
                msg = "An unhandled exception was caught in thread {}.\n\n{}"
                msg = msg.format(display_name, exc_text)
                logging.getLogger("RunSafe").exception("Action {} failed.".format(display_name))
                message(msg, "ZeppPlayer", lambda: os._exit(1))
        return _internal
    return _wrapper


def async_with_ui(display_name):
    def _wrapper(func):
        def _thread(*args, **kwargs):
            with_ui_exception(display_name)(func)(*args, **kwargs)

        def _internal(*args, **kwargs):
            threading.Thread(target=_thread, args=args, kwargs=kwargs).start()
        return _internal
    return _wrapper
