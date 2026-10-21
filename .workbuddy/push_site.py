# -*- coding: utf-8 -*-
"""Git Data API 增量推送：读取远程 tree -> 计算本地差异 -> 建 blob/tree/commit -> PATCH ref。

排除规则（不推送）：.git / .workbuddy / style-guide.html / 一切 *.txt（除 picture/README.txt、picture/private/README.txt）。
仅推送与远程不同的文件；远程存在但本地的非排除文件按删除处理（旧 URL 允许 404）。
"""
import argparse
import base64
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = r"D:/Workbuddyworkspace/mywebsite"
CFG = r"C:/Users/video/.workbuddy/github-auto-upload/config.json"
OWNER, REPO = "ExtremalMath", "ExtremalMath.github.io"
BRANCH = "main"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"

urllib.request.install_opener(
    urllib.request.build_opener(urllib.request.ProxyHandler({}))
)


def load_cfg():
    with open(CFG, encoding="utf-8") as f:
        return json.load(f)


def http(method, url, token, data=None, retry=5):
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "workbuddy-push",
        "Content-Type": "application/json",
    }
    last = None
    for i in range(retry):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read().decode("utf-8", "replace")
                return r.status, (json.loads(body) if body else {})
        except urllib.error.HTTPError as e:
            last = (e.code, e.read().decode("utf-8", "replace"))
            if e.code in (401, 403, 409, 422):
                return last
            time.sleep(2 * (i + 1))
        except Exception as e:  # noqa
            last = str(e)
            time.sleep(2 * (i + 1))
    return (0, {"error": str(last)})


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()


def excluded(rel):
    parts = rel.split("/")
    if parts[0] in (".git", ".workbuddy"):
        return True
    if rel == "style-guide.html":
        return True
    if rel.endswith(".txt"):
        if rel in ("picture/README.txt", "picture/private/README.txt"):
            return False
        return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--push", action="store_true", help="实际推送（默认 dry-run）")
    args = ap.parse_args()
    cfg = load_cfg()
    token = cfg["token"]

    st, ref = http("GET", f"{API}/git/ref/heads/{BRANCH}", token)
    assert st == 200, f"ref GET {st}: {ref}"
    commit_sha = ref["object"]["sha"]
    st, commit = http("GET", f"{API}/git/commits/{commit_sha}", token)
    assert st == 200, f"commit GET {st}"
    tree_sha = commit["tree"]["sha"]
    st, tree = http("GET", f"{API}/git/trees/{tree_sha}?recursive=1", token)
    assert st == 200, f"tree GET {st}"
    remote = {t["path"]: t["sha"] for t in tree.get("tree", []) if t["type"] == "blob"}
    remote_paths = set(remote)
    remote_blobs = set(remote.values())

    local = {}
    for dp, _, fns in os.walk(ROOT):
        for fn in fns:
            full = os.path.join(dp, fn)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            if excluded(rel):
                continue
            with open(full, "rb") as fh:
                data = fh.read()
            local[rel] = (data, blob_sha(data))

    adds, mods, dels = [], [], []
    for rel, (_, sha) in local.items():
        if rel in remote_paths:
            if remote[rel] != sha:
                mods.append(rel)
        else:
            adds.append(rel)
    for rel in remote_paths:
        if rel in local or excluded(rel):
            continue
        dels.append(rel)

    print(f"[dry-run={not args.push}] remote_blobs={len(remote_paths)} "
          f"local_syncable={len(local)}")
    print(f"  ADD={len(adds)} MODIFY={len(mods)} DELETE={len(dels)}")
    if not args.push:
        print("  ADD:")
        for x in sorted(adds):
            print("   +", x)
        print("  MODIFY:")
        for x in sorted(mods):
            print("   ~", x)
        print("  DELETE:")
        for x in sorted(dels):
            print("   -", x)
        return

    # Nothing to change — the remote is already current. Building an empty
    # tree would hit "Invalid tree info", so stop here instead.
    if not adds and not mods and not dels:
        print("  No changes; remote is already up to date.")
        return

    entries = []
    created = 0
    for rel in sorted(adds + mods):
        data, sha = local[rel]
        if sha not in remote_blobs:
            b64 = base64.b64encode(data).decode("ascii")
            st2, resp = http("POST", f"{API}/git/blobs", token,
                             json.dumps({"content": b64, "encoding": "base64"}).encode())
            if st2 != 201:
                print("  BLOB FAIL", rel, st2, resp)
                sys.exit(1)
            sha = resp["sha"]
            created += 1
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": sha})
    for rel in sorted(dels):
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": None})
    print(f"  blobs_created={created} tree_entries={len(entries)}")

    st3, new_tree = http("POST", f"{API}/git/trees", token,
                         json.dumps({"base_tree": tree_sha, "tree": entries}).encode())
    if st3 != 201:
        print("  TREE FAIL", st3, new_tree)
        sys.exit(1)
    new_tree_sha = new_tree["sha"]
    msg = ("fix: repair 404.html links and trim updates.js\n\n"
           "- 404.html: use site-root-absolute paths (/index.html, /migrations.html,\n"
           "  /nownow/now.html) so the File Migration Log and other links resolve\n"
           "  correctly from any missing-URL depth on GitHub Pages; bump footer to Oct 18, 2026\n"
           "- updates.js: consolidate the 2026-10-18 entries into one concise summary (\u2264100 words)")
    st4, new_commit = http("POST", f"{API}/git/commits", token,
                           json.dumps({"message": msg, "tree": new_tree_sha,
                                       "parents": [commit_sha]}).encode())
    if st4 != 201:
        print("  COMMIT FAIL", st4, new_commit)
        sys.exit(1)
    new_commit_sha = new_commit["sha"]
    st5, _ = http("PATCH", f"{API}/git/refs/heads/{BRANCH}", token,
                  json.dumps({"sha": new_commit_sha, "force": False}).encode())
    if st5 not in (200, 202):
        print("  REF PATCH FAIL", st5)
        sys.exit(1)
    print(f"  PUSH OK -> {new_commit_sha}")
    print(f"  https://github.com/{OWNER}/{REPO}/commit/{new_commit_sha}")


if __name__ == "__main__":
    main()
