# F2: rename the current tab.
# Prefill only an existing manual title; auto path mode starts empty.
# Blank Enter clears the override so the tab shows the path under ~/code again.

from kittens.tui.handler import result_handler
from kitty.boss import Boss


def main(args: list[str]) -> str:
    return ""


@result_handler(no_ui=True)
def handle_result(args: list[str], answer: str, target_window_id: int, boss: Boss) -> None:
    window = boss.window_id_map.get(target_window_id)
    if window is None:
        return
    tab = window.tabref()
    if tab is None:
        return

    def on_answer(title: str) -> None:
        tab.set_title((title or "").strip())

    boss.get_line(
        "Tab title — leave empty for path under ~/code",
        on_answer,
        window=window,
        initial_value=(tab.name or "").strip(),
    )
