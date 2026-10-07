from os.path import relpath
from pathlib import Path

CODE = Path.home() / "code"


def title_for_cwd(cwd: str) -> str:
    if not cwd:
        return "."
    try:
        return relpath(cwd, CODE)
    except ValueError:
        return cwd


def real_tab(tab):
    tab_id = getattr(tab, "tab_id", None)
    if tab_id is None:
        return None
    try:
        from kitty.boss import get_boss

        boss = get_boss()
        if boss is None:
            return None
        return boss.tab_for_id(tab_id)
    except Exception:
        return None


def shell_cwd(tab) -> str:
    # Prefer the foreground process cwd; fall back to active_wd.
    real = real_tab(tab)
    if real is not None:
        try:
            window = real.active_window
            if window is not None:
                cwd = window.child.current_cwd or ""
                if cwd:
                    return cwd
        except Exception:
            pass
    try:
        return tab.active_wd or ""
    except Exception:
        return ""


def manual_title(tab) -> str:
    real = real_tab(tab)
    if real is None:
        return ""
    try:
        return (real.name or "").strip()
    except Exception:
        return ""


def draw_title(data: dict) -> str:
    # Only an explicit set_tab_title / rename overrides the ~/code-relative path.
    name = manual_title(data["tab"])
    if name:
        return name
    return title_for_cwd(shell_cwd(data["tab"]))
