#!/bin/sh
# lint.sh — lint / type-check gate for CompanySite.
#
# This repo has no eslint config. The honest lint story is Astro's own
# diagnostics (astro check = TypeScript + Astro template checking).
# `--fix` is accepted for the Makefile `fmt` target's sake, but there is
# no auto-fixer wired up yet — astro check is check-only.
set -eu

if [ "${1:-}" = "--fix" ]; then
  echo "lint.sh: no auto-fix tool configured (no eslint/prettier config in repo);"
  echo "lint.sh: running check-only astro check instead."
fi

echo "lint.sh: running npx astro check (TypeScript + Astro diagnostics)"
npx astro check
