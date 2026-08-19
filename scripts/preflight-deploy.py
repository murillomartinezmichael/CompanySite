#!/usr/bin/env python3
"""Pre-deploy readiness check for the Astro + Cloudflare Pages CompanySite.

Usage:
    python scripts/preflight-deploy.py
    python scripts/preflight-deploy.py --live https://m3mm.net
    python scripts/preflight-deploy.py --strict

The build and test commands remain the primary release gates. This script
checks the deployment shape they produce and optionally confirms that the
custom domain serves the expected M3MM release rather than a fallback page.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:  # noqa: BLE001
    pass

REPO = Path(__file__).resolve().parent.parent
DIST = REPO / "dist"

GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

failures = 0
warnings_count = 0
skips = 0

KNOWN_SQUATTED_URLS = ["companysite-production.up.railway.app"]
SITE_SIGNATURES = ["M3MM", "Modernize. Mobilize. Multiply."]
REQUIRED_HEADERS = [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
]
REQUIRED_ROUTES = [
    "index.html",
    "accessibility/index.html",
    "audit/index.html",
    "hub/index.html",
    "policies/index.html",
    "roadmap/index.html",
    "start/index.html",
]


class PublicTextParser(HTMLParser):
    """Collect visible text and accessibility/metadata labels, not SVG path data."""

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"alt", "aria-label", "title", "content"} and value:
                self.parts.append(value)


def ok(label: str, detail: str = "") -> None:
    suffix = f"{DIM}  {detail}{RESET}" if detail else ""
    print(f"  {GREEN}✓{RESET} {label}{suffix}")


def fail(label: str, detail: str = "") -> None:
    global failures
    suffix = f"  {detail}" if detail else ""
    print(f"  {RED}✗{RESET} {label}{suffix}")
    failures += 1


def skip(label: str, detail: str = "") -> None:
    global skips
    suffix = f"{DIM}  {detail}{RESET}" if detail else ""
    print(f"  {YELLOW}○{RESET} {label}{suffix}")
    skips += 1


def check_package_contract() -> None:
    path = REPO / "package.json"
    if not path.exists():
        fail("package.json missing")
        return

    scripts = json.loads(path.read_text(encoding="utf-8")).get("scripts", {})
    build = scripts.get("build", "")
    verify = scripts.get("verify:dist", "")
    tests = scripts.get("test", "")
    missing = []
    if "astro build" not in build:
        missing.append("astro build")
    if "verify:dist" not in build:
        missing.append("verify:dist in build")
    if "check-shipped-placeholders" not in verify:
        missing.append("placeholder fence")
    if "vitest" not in tests:
        missing.append("vitest test script")

    if missing:
        fail("package release contract incomplete", ", ".join(missing))
    else:
        ok("package release contract: build + placeholder fence + tests")


def check_dist_shape() -> None:
    if not DIST.exists():
        fail("dist/ missing", "run npm run build first")
        return

    missing = [route for route in REQUIRED_ROUTES if not (DIST / route).is_file()]
    if missing:
        fail("required built routes missing", ", ".join(missing))
    else:
        ok(f"all {len(REQUIRED_ROUTES)} required built routes exist")

    index = DIST / "index.html"
    if index.is_file() and index.stat().st_size >= 10_000:
        ok("dist/index.html contains a non-trivial production page", f"{index.stat().st_size} bytes")
    elif index.is_file():
        fail("dist/index.html is unexpectedly small", f"{index.stat().st_size} bytes")

    for name in ["_headers", "_redirects"]:
        path = DIST / name
        if path.is_file() and path.stat().st_size > 0:
            ok(f"dist/{name} present")
        else:
            fail(f"dist/{name} missing or empty")

    for name in ["lead.ts", "track.ts"]:
        path = REPO / "functions" / "api" / name
        if path.is_file() and path.stat().st_size > 0:
            ok(f"functions/api/{name} present")
        else:
            fail(f"functions/api/{name} missing or empty")


def check_security_headers() -> None:
    path = DIST / "_headers"
    if not path.exists():
        return
    source = path.read_text(encoding="utf-8", errors="replace")
    missing = [header for header in REQUIRED_HEADERS if header not in source]
    if missing:
        fail("dist/_headers missing security headers", ", ".join(missing))
    else:
        ok(f"dist/_headers declares all {len(REQUIRED_HEADERS)} required headers")


def check_shipped_html() -> None:
    html_files = sorted(DIST.rglob("*.html")) if DIST.exists() else []
    if not html_files:
        fail("no built HTML files found")
        return

    external_links: list[str] = []
    squatted_hits: list[str] = []
    legacy_brand_hits: list[str] = []
    for path in html_files:
        source = path.read_text(encoding="utf-8", errors="replace")
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', source)
        external_links.extend(href for href in hrefs if href.startswith("http"))
        squatted_hits.extend(
            href for href in hrefs if any(blocked in href for blocked in KNOWN_SQUATTED_URLS)
        )
        parser = PublicTextParser()
        parser.feed(source)
        public_text = " ".join(parser.parts)
        if "M³" in public_text or re.search(r"(?<![A-Za-z0-9])M3(?![A-Za-z0-9])", public_text):
            legacy_brand_hits.append(str(path.relative_to(DIST)))

    if squatted_hits:
        fail("outbound links include a retired or wrong-tenant URL", ", ".join(sorted(set(squatted_hits))))
    else:
        ok("outbound links exclude retired Railway tenant", f"{len(external_links)} external hrefs checked")

    if legacy_brand_hits:
        fail("built pages contain a legacy typed M3/M³ wordmark", ", ".join(legacy_brand_hits))
    else:
        ok("built pages use M3MM branding only")


def check_live(url: str) -> None:
    if not url.startswith("http"):
        url = "https://" + url
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "m3mm-preflight"})
        with urllib.request.urlopen(request, timeout=10) as response:
            status = response.status
            body = response.read(300_000).decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        fail(f"HTTP error probing {url}", f"{error.code} {error.reason}")
        return
    except Exception as error:  # noqa: BLE001
        fail(f"probe failed for {url}", f"{type(error).__name__}: {error}")
        return

    if status != 200:
        fail(f"live probe {url}", f"HTTP {status}")
        return
    missing = [signature for signature in SITE_SIGNATURES if signature not in body]
    if missing:
        fail("live URL is missing release signatures", ", ".join(missing))
    else:
        ok(f"live URL {url} serves the M3MM release")


def main() -> int:
    args = sys.argv[1:]
    strict = "--strict" in args
    live_url = None
    if "--live" in args:
        try:
            live_url = args[args.index("--live") + 1]
        except IndexError:
            fail("--live requires a URL argument")

    print(f"\n{BOLD}CompanySite preflight — deploy readiness{RESET}\n")
    check_package_contract()
    check_dist_shape()
    check_security_headers()
    check_shipped_html()
    if live_url:
        check_live(live_url)
    else:
        skip("live probe", "pass --live URL after deployment")

    print()
    if failures == 0 and (not strict or warnings_count == 0):
        print(f"{GREEN}{BOLD}READY{RESET}  {DIM}({skips} optional check skipped){RESET}\n")
        return 0
    print(f"{RED}{BOLD}NOT READY{RESET}  {failures} check(s) failed\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
