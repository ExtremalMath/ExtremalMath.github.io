#!/usr/bin/env python3
"""validate_filenames.py — scan published resource tree for filename violations.

Aligns with .workbuddy/rename-rules.md:
  - public resource filenames: lowercase [a-z0-9], underscore separator,
    single-dot extension; no uppercase/space/CJK/double-underscore/
    leading-or-trailing _ or ./double-dot.
  - README.* are sanctioned exceptions and skipped.

Usage:
    python validate_filenames.py [site_root] [--json]
Exit code 0 = clean, 1 = violations found.
"""
import os
import re
import sys
import json

RESOURCE_ROOTS = ["book", "notes", "talks", "code", "picture"]

# Path-level baseline (dir + file segments share the same shape).
BASELINE_RE = re.compile(
    r"^(?:[a-z0-9]+(?:_[a-z0-9]+)*/)*[a-z0-9]+(?:_[a-z0-9]+)*\.[a-z0-9]{1,12}$"
)

# Violation detectors applied to the relative path.
VIOLATIONS = [
    ("uppercase", re.compile(r"[A-Z]")),
    ("space", re.compile(r" ")),
    ("cjk", re.compile(r"[\u4e00-\u9fff]")),
    ("double_dot", re.compile(r"\.\.")),
    ("double_underscore", re.compile(r"__")),
    ("leading_trailing", re.compile(r"^[_.]|[_.]$")),
    ("non_charset", re.compile(r"[^a-z0-9_./]")),
]

SKIP_DIRS = {".git", ".workbuddy", "node_modules"}


def main() -> int:
    args = sys.argv[1:]
    root = "."
    as_json = False
    for a in args:
        if a == "--json":
            as_json = True
        elif not a.startswith("-"):
            root = a

    problems = []
    for res in RESOURCE_ROOTS:
        base = os.path.join(root, res)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for fn in filenames:
                if fn.lower().startswith("readme"):  # sanctioned exception
                    continue
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, root).replace(os.sep, "/")
                # talks/ HTML uses hyphens by historical convention; treat '-' as
                # an equivalent separator for validation only (report original path).
                check_rel = rel.replace("-", "_") if rel.startswith("talks/") else rel
                reasons = set()
                for name, rx in VIOLATIONS:
                    if rx.search(check_rel):
                        reasons.add(name)
                if not BASELINE_RE.match(check_rel):
                    reasons.add("fails_baseline_regex")
                if reasons:
                    problems.append({"path": rel, "reasons": sorted(reasons)})

    if as_json:
        print(json.dumps(problems, indent=2, ensure_ascii=False))
    elif not problems:
        print("OK: 0 filename violations")
    else:
        for p in problems:
            print(f"[VIOLATION] {p['path']} -> {', '.join(p['reasons'])}")
        print(f"\nTotal: {len(problems)} violation(s)")

    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
