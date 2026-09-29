from os.path import relpath
from pathlib import Path

CODE = Path.home() / "code"


def title_for_cwd(cwd: str) -> str:
    if not cwd:
        return "."
    return relpath(cwd, CODE)


def draw_title(data: dict) -> str:
    try:
        cwd = data["tab"].active_wd or ""
    except Exception:
        cwd = ""
    return title_for_cwd(cwd)
