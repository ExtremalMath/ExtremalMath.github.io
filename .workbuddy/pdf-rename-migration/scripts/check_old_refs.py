# -*- coding: utf-8 -*-
"""check_old_refs.py — 扫描全站 HTML/JS，确认无旧路径/旧文件名/旧目录名残留。

退出码：0 = 无残留；1 = 有残留。历史更新日志（updates.js）如出现旧文件名
属于历史记录，不计入残留（单独提示）。
"""
import csv
import os
import sys

ROOT = r"D:/Workbuddyworkspace/mywebsite"
PROJ = os.path.join(ROOT, ".workbuddy", "pdf-rename-migration")
MAP = os.path.join(PROJ, "mapping", "rename-map.csv")

HISTORICAL = {"updates.js"}  # 更新日志：历史条目不改写


def main():
    with open(MAP, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    needles = []
    for r in rows:
        needles.append(r["原相对路径"])
        needles.append(r["原文件名"])
    needles.append("notes/GraphTheoryHomework")  # 旧目录名
    needles = [n for n in dict.fromkeys(needles) if n]

    site_files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", ".workbuddy")]
        for fn in filenames:
            if fn.endswith((".html", ".js")):
                site_files.append(os.path.join(dirpath, fn))

    bad = hist = 0
    for f in sorted(site_files):
        rel = os.path.relpath(f, ROOT).replace(os.sep, "/")
        with open(f, encoding="utf-8", errors="ignore") as fh:
            text = fh.read()
        for n in needles:
            if n in text:
                if os.path.basename(rel) in HISTORICAL:
                    print("  historical-log note: %s in %s" % (n, rel))
                    hist += 1
                else:
                    print("  RESIDUE: %s in %s" % (n, rel))
                    bad += 1
    print("OLD-REF SCAN: %d files scanned, %d residue(s), %d historical-log note(s)"
          % (len(site_files), bad, hist))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
