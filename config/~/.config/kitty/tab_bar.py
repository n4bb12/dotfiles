from os.path import relpath
from pathlib import Path

CODE = Path.home() / "code"


def title_for_cwd(cwd: str) -> str:
    if not cwd:
        return "."
    return relpath(cwd, CODE)


def shell_cwd(tab) -> str:
    # active_wd finds the foreground process by reading every /proc entry.
    tab_id = getattr(tab, "tab_id", None)
    if tab_id is not None:
        try:
            from kitty.boss import get_boss

            boss = get_boss()
            if boss is not None:
                real = boss.tab_for_id(tab_id)
                window = real.active_window if real is not None else None
                if window is None:
                    return ""
                return window.child.current_cwd or ""
        except Exception:
            pass
    try:
        return tab.active_wd or ""
    except Exception:
        return ""


def draw_title(data: dict) -> str:
    return title_for_cwd(shell_cwd(data["tab"]))
