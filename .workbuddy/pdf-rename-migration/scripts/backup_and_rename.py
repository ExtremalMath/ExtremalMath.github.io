# -*- coding: utf-8 -*-
"""backup_and_rename.py — 按 mapping/rename-map.csv 备份原文件并执行改名。

流程：原文件复制到 backup/（保留旧相对路径与旧文件名）→ 原地改名到新路径。
幂等：已改名的条目跳过；原文件缺失且新文件已存在时视为已完成。
回滚：将 backup/ 下对应文件复制回站点根目录原路径即可。
"""
import csv
import os
import shutil
import sys

ROOT = r"D:/Workbuddyworkspace/mywebsite"
PROJ = os.path.join(ROOT, ".workbuddy", "pdf-rename-migration")
MAP = os.path.join(PROJ, "mapping", "rename-map.csv")
BACKUP = os.path.join(PROJ, "backup")


def main():
    with open(MAP, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    done = skipped = 0
    for r in rows:
        old_rel, new_rel = r["原相对路径"], r["新相对路径"]
        old_abs = os.path.join(ROOT, old_rel)
        new_abs = os.path.join(ROOT, new_rel)
        bak_abs = os.path.join(BACKUP, old_rel)
        if not os.path.exists(old_abs):
            if os.path.exists(new_abs):
                print("  skip (already renamed): %s" % old_rel)
                skipped += 1
                continue
            print("  ERROR missing: %s" % old_rel)
            sys.exit(1)
        os.makedirs(os.path.dirname(bak_abs), exist_ok=True)
        if not os.path.exists(bak_abs):
            shutil.copy2(old_abs, bak_abs)
            print("  backup: %s" % old_rel)
        os.makedirs(os.path.dirname(new_abs), exist_ok=True)
        os.rename(old_abs, new_abs)
        print("  renamed: %s -> %s" % (old_rel, new_rel))
        done += 1
    print("BACKUP+RENAME OK: %d renamed, %d skipped" % (done, skipped))


if __name__ == "__main__":
    main()
