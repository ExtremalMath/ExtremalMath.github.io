# -*- coding: utf-8 -*-
"""Remove exercise-notes PDF: update homework.html + updates.js, delete book/FiniteFields_FengLiao.pdf."""
import base64, json, time, os, urllib.request, urllib.error

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
ROOT = r"D:/Workbuddyworkspace/mywebsite"

ADD = ["study/homework.html", "updates.js"]
DELETE = ["book/FiniteFields_FengLiao.pdf"]
MSG = "Remove Finite Fields exercise-notes (T7T10) PDF and its Homework section"

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
            print(f"  retry {attempt+1}: {e}")
            time.sleep(5)

br = req("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base:", base_commit[:10])

# confirm delete target present in base tree
tree_list = req("GET", f"/git/trees/{base_tree}?recursive=1")["tree"]
paths = {e["path"] for e in tree_list}
for rel in DELETE:
    print(f"  delete target present in remote? {'YES' if rel in paths else 'NO -> will skip'}")

entries = []
for rel in ADD:
    raw = open(os.path.join(ROOT, rel.replace("/", os.sep)), "rb").read()
    b = req("POST", "/git/blobs", {"content": base64.b64encode(raw).decode("ascii"), "encoding": "base64"})
    entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": b["sha"]})
    print(f"  blob ok: {rel} ({len(raw)} bytes)")
for rel in DELETE:
    if rel in paths:
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": None})
        print(f"  delete: {rel}")

tree = req("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
print("tree:", tree["sha"][:10])
commit = req("POST", "/git/commits", {"message": MSG, "tree": tree["sha"], "parents": [base_commit]})
print("commit:", commit["sha"][:10])
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref ->", ref["object"]["sha"][:10])
print("PUSH OK:", commit["sha"])
