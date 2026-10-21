# -*- coding: utf-8 -*-
"""verify_redirects.py — 线上验证：每个旧 URL 必须返回 301 指向新 URL，新 URL 返回 200。

- 不自动跟随重定向（自定义 opener），以读取状态码与 Location 头。
- 绕过本机代理直连（ProxyHandler({})）。
- 退出码：0 = 全部通过；1 = 存在失败。失败时逐条打印实际状态，供验证报告引用。
"""
import argparse
import csv
import os
import sys
import urllib.error
import urllib.request

ROOT = r"D:/Workbuddyworkspace/mywebsite"
PROJ = os.path.join(ROOT, ".workbuddy", "pdf-rename-migration")
MAP = os.path.join(PROJ, "mapping", "rename-map.csv")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(opener, url):
    """返回 (status, location)。网络异常时 status=None。"""
    try:
        with opener.open(urllib.request.Request(url, method="GET"), timeout=30) as resp:
            return resp.status, resp.headers.get("Location")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location")
    except Exception as e:
        print("    network error: %s" % e)
        return None, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default=None,
                    help="Override host in both old/new URLs, e.g. "
                         "extremalmath.netlify.app. Default keeps the "
                         "URLs from rename-map.csv (extremalmath.github.io).")
    args = ap.parse_args()
    opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({}), NoRedirect)
    with open(MAP, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    ok = fail = 0
    for r in rows:
        old_url, new_url = r["原URL"], r["新URL"]
        if args.host:
            old_url = old_url.replace("extremalmath.github.io", args.host)
            new_url = new_url.replace("extremalmath.github.io", args.host)
        status, loc = fetch(opener, old_url)
        if status is None:
            print("  FAIL old (unreachable): %s" % old_url)
            fail += 1
            continue
        if status != 301 or (loc or "").rstrip("/") != new_url.rstrip("/"):
            print("  FAIL old: %s -> status=%s location=%s (expected 301 -> %s)"
                  % (old_url, status, loc, new_url))
            fail += 1
            continue
        nstatus, _ = fetch(opener, new_url)
        if nstatus == 200:
            print("  PASS: %s -> 301 -> %s (200)" % (old_url, new_url))
            ok += 1
        else:
            print("  FAIL new: %s -> status=%s (expected 200)" % (new_url, nstatus))
            fail += 1
    print("REDIRECT VERIFY: %d pass, %d fail" % (ok, fail))
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
