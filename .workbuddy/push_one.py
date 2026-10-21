# -*- coding: utf-8 -*-
"""Push a given list of files to GitHub via Git Data API (one commit, fast-forward).

Usage:
  push_one.py "<rel1>,<rel2>,..." "<commit message>"

Base commit is read fresh from /branches/main each run, so running it twice
chains commits correctly. style-guide.html is hard-blocked.
"""
import base64, json, sys, time, os, urllib.request, urllib.error

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
ROOT = r"D:/Workbuddyworkspace/mywebsite"

FILES = [f.strip() for f in sys.argv[1].split(",") if f.strip()]
MSG = sys.argv[2] if len(sys.argv) > 2 else "Update site"

assert "style-guide.html" not in FILES, "style-guide.html must NEVER be pushed"

def req(method, path, data=None):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}" + path
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(url, data=body, method=method)
    r.add_header("Authorization", f"Bearer {TOKEN}")
    r.add_header("User-Agent", "wb")
    r.add_header("Accept", "application/vnd.github+json")
    if body:
        r.add_header("Content-Type", "application/json")
    for attempt in range(6):
        try:
            with urllib.request.urlopen(r, timeout=120) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "ignore")[:300]
            if attempt == 5:
                raise RuntimeError(f"{method} {path} -> {e.code} {detail}")
            print(f"  HTTP {e.code} retry {attempt+1}: {detail}")
            time.sleep(5)
        except Exception as e:
            if attempt == 5:
                raise
            print(f"  retry {attempt+1} after: {e}")
            time.sleep(5)

# 1. base
br = req("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base:", base_commit[:10])

# 2. blobs
entries = []
for rel in FILES:
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    raw = open(path, "rb").read()
    b = req("POST", "/git/blobs", {
        "content": base64.b64encode(raw).decode("ascii"),
        "encoding": "base64",
    })
    entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": b["sha"]})
    print(f"  blob ok: {rel} ({len(raw)} bytes)")

# 3. tree
tree = req("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
print("tree:", tree["sha"][:10])

# 4. commit
commit = req("POST", "/git/commits", {
    "message": MSG,
    "tree": tree["sha"],
    "parents": [base_commit],
})
print("commit:", commit["sha"][:10])

# 5. ref (fast-forward)
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref ->", ref["object"]["sha"][:10])
print("PUSH OK:", commit["sha"])
