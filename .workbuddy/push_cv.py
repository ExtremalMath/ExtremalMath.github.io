# -*- coding: utf-8 -*-
"""Push CV generator (4 functional files) + updates.js + push-rules.txt + troubleshooting.txt."""
import base64, json, time, os, urllib.request, urllib.error

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
ROOT = r"D:/Workbuddyworkspace/mywebsite"

ADD = [
    "cv-pdf-generator/cv.html",
    "cv-pdf-generator/cv-zh.html",
    "cv-pdf-generator/cv-en.html",
    "cv-pdf-generator/cv-generator.js",
    "updates.js",
    "push-rules.txt",
    "troubleshooting.txt",
]
MSG = "Add bilingual CV generator and publish maintenance docs; tighten updates.js"

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

entries = []
for rel in ADD:
    raw = open(os.path.join(ROOT, rel.replace("/", os.sep)), "rb").read()
    b = req("POST", "/git/blobs", {"content": base64.b64encode(raw).decode("ascii"), "encoding": "base64"})
    entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": b["sha"]})
    print(f"  blob ok: {rel} ({len(raw)} bytes)")

tree = req("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
print("tree:", tree["sha"][:10])
commit = req("POST", "/git/commits", {"message": MSG, "tree": tree["sha"], "parents": [base_commit]})
print("commit:", commit["sha"][:10])
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref ->", ref["object"]["sha"][:10])
print("PUSH OK:", commit["sha"])
