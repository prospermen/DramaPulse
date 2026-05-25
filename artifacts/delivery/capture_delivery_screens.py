from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
SCREENSHOT_DIR = ROOT / "artifacts" / "delivery" / "screenshots"


def capture() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        admin = browser.new_page(viewport={"width": 1440, "height": 900})
        admin.goto("http://127.0.0.1:5173", wait_until="networkidle")
        admin.wait_for_timeout(1500)
        admin.screenshot(path=SCREENSHOT_DIR / "admin-dashboard.png", full_page=True)

        mobile = browser.new_page(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        mobile.goto("http://127.0.0.1:62880", wait_until="networkidle")
        mobile.wait_for_timeout(2500)
        mobile.screenshot(path=SCREENSHOT_DIR / "mobile-entry.png", full_page=True)

        browser.close()


if __name__ == "__main__":
    capture()
