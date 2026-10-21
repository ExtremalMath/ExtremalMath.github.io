# -*- coding: utf-8 -*-
"""update_references.py — 按 mapping/rename-map.csv 批量替换站内页面引用。

将各引用页面中的旧相对路径替换为新相对路径（精确字符串替换）。
幂等：目标已为新路径的页面跳过；找不到旧路径且新路径也不存在时报错退出。
"""
import csv
import os
import sys

ROOT = r"D:/Workbuddyworkspace/mywebsite"
PROJ = os.path.join(ROOT, ".workbuddy", "pdf-rename-migration")
MAP = os.path.join(PROJ, "mapping", "rename-map.csv")


def main():
    with open(MAP, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    total = 0
    for r in rows:
        old_rel, new_rel = r["原相对路径"], r["新相对路径"]
        pages = [p.strip() for p in r["引用页面"].split(";") if p.strip() and p.strip() != "(无)"]
        for page in pages:
            p_abs = os.path.join(ROOT, page)
            if not os.path.exists(p_abs):
                print("  ERROR page missing: %s" % page)
                sys.exit(1)
            with open(p_abs, encoding="utf-8") as f:
                text = f.read()
            n = text.count(old_rel)
            if n == 0:
                if new_rel in text:
                    print("  skip (already updated): %s -> %s" % (page, new_rel))
                    continue
                print("  ERROR no ref: %s in %s" % (old_rel, page))
                sys.exit(1)
            text = text.replace(old_rel, new_rel)
            with open(p_abs, "w", encoding="utf-8", newline="") as f:
                f.write(text)
            print("  updated %d ref(s): %s: %s -> %s" % (n, page, old_rel, new_rel))
            total += n
    print("REFERENCE UPDATE OK: %d replacement(s)" % total)


if __name__ == "__main__":
    main()
