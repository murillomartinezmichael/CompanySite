#!/usr/bin/env python3
"""preflight-deploy.py — pre-deploy readiness check for CompanySite.

Runs in ~1 second. Verifies the static site will boot on Railway (nginx:alpine
as USER nginx on ${PORT:-8080}), that index.html is real content (not a stub),
that the security headers survived any nginx.conf edits, and that no outbound
links point at known-squatted or wrong-tenant URLs.

Modes
-----
    python scripts/preflight-deploy.py             # base checks
    python scripts/preflight-deploy.py --live URL  # + curl the live URL
    python scripts/preflight-deploy.py --strict    # fail on warn-level issues

What it checks
--------------
    1. Dockerfile: FROM nginx:alpine + USER nginx + PORT substitution
    2. nginx.conf: NGINX_PORT placeholder + 5 security headers present
    3. index.html: exists + > 50 KB (this site is ~6000 lines, ~250 KB)
    4. Outbound-link audit: no hrefs to known-squatted URLs
       (companysite-production.up.railway.app is currently "Next Wave Apps"
       per STATUS.md — flag if it reappears in index.html)
    5. Branding: no "Offload Labs" in customer-facing content
       (rule from top-level CLAUDE.md — M³ only)
    6. --live: probe the given URL + verify a signature string is in the body
       so we don't mistake a squatted URL for our own site

Exit codes: 0 all green, 1 any base check failed. Suitable as a CI gate.
"""

from __future__ import annotations
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:  # noqa: BLE001
    pass

REPO = Path(__file__).resolve().parent.parent

GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

failures = 0
warnings_count = 0
skips = 0

# URLs that were once ours but are now squatted / wrong tenant. If any of
# these show up as an href in index.html, we're actively sending buy-intent
# traffic to somebody else's app. STATUS.md tracks the current dispute.
KNOWN_SQUATTED_URLS = [
    "companysite-production.up.railway.app",  # → "Next Wave Apps" as of 2026-07-03
]

# Signature strings we expect to see in our own served body. If --live probes
# a URL and none of these appear, we've got the wrong URL (squatted or a
# fallback landing page).
SITE_SIGNATURES = [
    "M³",
    "murillomartinezmichael@gmail.com",
]

# Security headers from nginx.conf § "SECURITY_AUDIT.md § M3-M6". If any of
# these fall out of nginx.conf, the site loses defense-in-depth on live.
REQUIRED_HEADERS = [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
]


def ok(label: str, detail: str = "") -> None:
    d = f"{DIM}  {detail}{RESET}" if detail else ""
    print(f"  {GREEN}✓{RESET} {label}{d}")


def fail(label: str, detail: str = "") -> None:
    global failures
    d = f"  {detail}" if detail else ""
    print(f"  {RED}✗{RESET} {label}{d}")
    failures += 1


def warn(label: str, detail: str = "") -> None:
    global warnings_count
    d = f"  {detail}" if detail else ""
    print(f"  {YELLOW}⚠{RESET} {label}{d}")
    warnings_count += 1


def skip(label: str, detail: str = "") -> None:
    global skips
    d = f"{DIM}  {detail}{RESET}" if detail else ""
    print(f"  {YELLOW}○{RESET} {label}{d}")
    skips += 1


def check_dockerfile() -> None:
    path = REPO / "Dockerfile"
    if not path.exists():
        fail("Dockerfile missing")
        return
    src = path.read_text(encoding="utf-8")
    checks = {
        "FROM nginx:alpine": "FROM nginx:alpine" in src or "from nginx:alpine" in src.lower(),
        "USER nginx (non-root)": re.search(r"^USER\s+nginx\b", src, re.MULTILINE) is not None,
        "PORT substitution": "${PORT" in src or "$PORT" in src,
        "COPY index.html": "index.html" in src and "COPY" in src.upper(),
        "COPY nginx.conf": "nginx.conf" in src and "COPY" in src.upper(),
    }
    missing = [k for k, v in checks.items() if not v]
    if missing:
        fail("Dockerfile incomplete", "missing: " + "; ".join(missing))
    else:
        ok("Dockerfile: nginx:alpine + USER nginx + PORT + COPYs")


def check_nginx_conf() -> None:
    path = REPO / "nginx.conf"
    if not path.exists():
        fail("nginx.conf missing")
        return
    src = path.read_text(encoding="utf-8")

    if "NGINX_PORT" not in src:
        fail("nginx.conf missing NGINX_PORT placeholder", "Dockerfile sed replaces it at boot")
    else:
        ok("nginx.conf declares NGINX_PORT placeholder")

    missing_headers = [h for h in REQUIRED_HEADERS if h not in src]
    if missing_headers:
        fail(
            f"nginx.conf missing {len(missing_headers)} security header(s)",
            ", ".join(missing_headers),
        )
    else:
        ok(f"nginx.conf declares all {len(REQUIRED_HEADERS)} security headers")

    # Sanity: headers must be repeated inside `location = /index.html` because
    # nginx `add_header` inheritance resets when a nested block declares any.
    # If the location block exists but is missing one of the 5, index.html
    # will silently drop those headers.
    m = re.search(
        r"location\s*=\s*/index\.html\s*\{(.*?)\}",
        src,
        re.DOTALL,
    )
    if m:
        loc_body = m.group(1)
        loc_missing = [h for h in REQUIRED_HEADERS if h not in loc_body]
        if loc_missing:
            fail(
                f"`location = /index.html` drops {len(loc_missing)} inherited header(s)",
                ", ".join(loc_missing) + " (see comment in nginx.conf)",
            )
        else:
            ok("`location = /index.html` re-declares all 5 security headers")


def check_index_html() -> None:
    path = REPO / "index.html"
    if not path.exists():
        fail("index.html missing")
        return
    size = path.stat().st_size
    src = path.read_text(encoding="utf-8", errors="replace")

    if size < 50_000:
        fail(f"index.html is only {size} bytes", "expected > 50 KB for this site")
    else:
        ok(f"index.html present + {size // 1024} KB ({src.count(chr(10)) + 1} lines)")

    hrefs = re.findall(r'href=["\']([^"\']+)["\']', src)
    external = [h for h in hrefs if h.startswith("http")]

    hits = [
        h for h in external
        if any(bad in h for bad in KNOWN_SQUATTED_URLS)
    ]
    if hits:
        fail(
            f"{len(hits)} outbound link(s) point at known-squatted URL(s)",
            "; ".join(sorted(set(hits))[:3]) + " — see STATUS.md",
        )
    else:
        ok(f"outbound links clean ({len(external)} external hrefs, 0 squatted)")

    if "Offload Labs" in src:
        fail(
            "index.html contains 'Offload Labs'",
            "rule from top-level CLAUDE.md: M³ branding only on customer-facing surfaces",
        )
    else:
        ok("index.html branding: M³-only (no 'Offload Labs' leaks)")


def check_live(url: str) -> None:
    """Probe a live URL + verify our signature strings appear.
    Guards against pointing --live at a squatted URL."""
    if not url.startswith("http"):
        url = "https://" + url

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "preflight-deploy"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            code = resp.status
            body = resp.read(200_000).decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        fail(f"HTTP error probing {url}", f"{e.code} {e.reason}")
        return
    except Exception as e:  # noqa: BLE001
        fail(f"probe failed for {url}", f"{type(e).__name__}: {e}")
        return

    if code != 200:
        fail(f"live probe {url}", f"HTTP {code}")
        return

    found = [s for s in SITE_SIGNATURES if s in body]
    missing = [s for s in SITE_SIGNATURES if s not in body]
    if missing:
        fail(
            f"live URL responds 200 but body missing {len(missing)} signature(s)",
            f"missing: {', '.join(missing)} — is this URL squatted / wrong tenant?",
        )
    else:
        ok(f"live URL {url} serves CompanySite", f"signatures matched: {', '.join(found)}")


def main() -> int:
    args = sys.argv[1:]
    strict = "--strict" in args

    live_url = None
    if "--live" in args:
        try:
            live_url = args[args.index("--live") + 1]
        except IndexError:
            fail("--live requires a URL argument", "e.g. --live companysite.example.com")

    print(f"\n{BOLD}CompanySite preflight — deploy readiness{RESET}\n")

    check_dockerfile()
    check_nginx_conf()
    check_index_html()

    if live_url:
        check_live(live_url)
    else:
        skip("live probe", "pass --live URL to verify prod serves CompanySite (not a squatted URL)")

    print()
    if failures == 0 and (not strict or warnings_count == 0):
        s = "s" if skips != 1 else ""
        w = f", {warnings_count} warn" if warnings_count else ""
        print(f"{GREEN}{BOLD}READY{RESET}  {DIM}({skips} optional check{s} skipped{w}){RESET}\n")
        return 0
    else:
        fail_word = "check" if failures == 1 else "checks"
        extra = ""
        if warnings_count and strict:
            extra = f", {warnings_count} warn (strict mode)"
        if skips:
            extra += f", {skips} skipped"
        print(f"{RED}{BOLD}NOT READY{RESET}  {failures} {fail_word} failed{extra}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
