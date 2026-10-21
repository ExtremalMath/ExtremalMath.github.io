# -*- coding: utf-8 -*-
"""Push site-wide format unification via Git Data API (incremental, no deletions)."""
import base64, json, time, urllib.request, urllib.error, os

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
ROOT = r"D:/Workbuddyworkspace/mywebsite"

# files to push (relative paths); style-guide.html is EXCLUDED on purpose
FILES = [
    "index.html",
    "about.html",
    "404.html",
    "myteachers.html",
    "statement.html",
    "teaching.html",
    "updates.js",
    "style-guide.txt",
    "push-rules.txt",
    "nownow/now.html",
    "research/research-log.html",
    "research/research-directions.html",
    "study/materials.html",
    "study/homework.html",
    "study/books.html",
    "study/notes.html",
    "study/course-essay.html",
    "study/academic-sites.html",
    "talks/talks.html",
    "talks/report-kitchen-waste.html",
]

def req(method, path, data=None):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}" + path
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(url, data=body, method=method)
    r.add_header("Authorization", f"Bearer {TOKEN}")
    r.add_header("User-Agent", "wb")
    r.add_header("Accept", "application/vnd.github+json")
    if body:
        r.add_header("Content-Type", "application/json")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(r, timeout=90) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt == 4:
                raise
            print(f"  retry {attempt+1} after error: {e}")
            time.sleep(4)

# sanity: ensure style-guide.html is NOT in the list
assert "style-guide.html" not in FILES, "style-guide.html must never be pushed"

# 1. base commit / tree
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

# 3. tree  (API field name is "tree", NOT "entries")
tree = req("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
print("tree:", tree["sha"][:10])

# 4. commit
commit = req("POST", "/git/commits", {
    "message": "Unify all pages with the style guide (colors, layout, links, dates)",
    "tree": tree["sha"],
    "parents": [base_commit],
})
print("commit:", commit["sha"][:10])

# 5. update ref (fast-forward only)
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref updated ->", ref["object"]["sha"][:10])
print("PUSH OK:", commit["sha"])
