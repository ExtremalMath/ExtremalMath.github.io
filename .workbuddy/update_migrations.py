# -*- coding: utf-8 -*-
"""维护 File Migration Log（migrations.html）的数据源。

数据源：.workbuddy/migrations.json（canonical）
生成物：站点根目录 migrations-data.js（页面加载，勿手改）

UNIQUE KEY = filename。
- add：若 filename 已存在则整体覆盖（仅保留最后一次迁移）；否则追加。
- list：打印当前全部记录。
- remove：按 filename 删除。
- gen：仅依据 json 重新生成 migrations-data.js。

所有写操作后自动重新生成 migrations-data.js，使页面“实时”反映最新状态
（下次加载即生效，无需改 HTML）。

用法：
  python update_migrations.py add "<filename>" "<oldPath>" "<newPath>" ["YYYY-MM-DD"]
  python update_migrations.py list
  python update_migrations.py remove "<filename>"
  python update_migrations.py gen
"""
import argparse
import datetime
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(HERE, "migrations.json")
JS_PATH = os.path.join(os.path.dirname(HERE), "migrations-data.js")

HEADER = (
    "// migrations-data.js — AUTO-GENERATED from .workbuddy/migrations.json. "
    "Do not edit by hand.\n"
    "// To change the log: edit migrations.json and run update_migrations.py,\n"
    "// or: python update_migrations.py add \"<filename>\" \"<oldPath>\" \"<newPath>\" [YYYY-MM-DD]\n"
    "// UNIQUE KEY = filename. Re-adding the same filename OVERWRITES the previous record\n"
    "// (the page shows only the latest migration per file; history is not retained).\n"
)


def load():
    with open(JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def save(data):
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def gen_js(data):
    entries = data.get("entries", [])
    body = ",\n".join(
        '  { "filename": %s, "oldPath": %s, "newPath": %s, "time": %s }'
        % (json.dumps(e["filename"]), json.dumps(e["oldPath"]),
           json.dumps(e["newPath"]), json.dumps(e["time"]))
        for e in entries
    )
    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write(HEADER)
        f.write("const SITE_MIGRATIONS = [\n")
        f.write(body)
        f.write("\n];\n")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    a_add = sub.add_parser("add")
    a_add.add_argument("filename")
    a_add.add_argument("oldPath")
    a_add.add_argument("newPath")
    a_add.add_argument("time", nargs="?", default=datetime.date.today().isoformat())

    sub.add_parser("list")
    a_rm = sub.add_parser("remove")
    a_rm.add_argument("filename")
    sub.add_parser("gen")

    args = ap.parse_args()
    data = load()

    if args.cmd == "add":
        rec = {"filename": args.filename, "oldPath": args.oldPath,
               "newPath": args.newPath, "time": args.time}
        replaced = False
        for i, e in enumerate(data["entries"]):
            if e["filename"] == args.filename:
                data["entries"][i] = rec
                replaced = True
                break
        if not replaced:
            data["entries"].append(rec)
        save(data)
        gen_js(data)
        print(("OVERWROTE" if replaced else "ADDED"), args.filename, "->", args.newPath)
    elif args.cmd == "list":
        for e in data["entries"]:
            print(f'{e["time"]}  {e["filename"]}\n    old: {e["oldPath"]}\n    new: {e["newPath"]}')
    elif args.cmd == "remove":
        before = len(data["entries"])
        data["entries"] = [e for e in data["entries"] if e["filename"] != args.filename]
        if len(data["entries"]) == before:
            print("NOT FOUND", args.filename)
        else:
            save(data)
            gen_js(data)
            print("REMOVED", args.filename)
    elif args.cmd == "gen":
        gen_js(data)
        print("REGENERATED", JS_PATH)


if __name__ == "__main__":
    main()
