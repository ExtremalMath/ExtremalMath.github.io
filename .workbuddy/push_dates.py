import json, urllib.request, urllib.error, time

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
BASE = f"https://api.github.com/repos/{OWNER}/{REPO}"
ROOT = r"D:/Workbuddyworkspace/mywebsite"

FILES = [
    "about.html",
    "homework.html",
    "books.html",
    "notes.html",
    "course-essay.html",
    "materials.html",
    "academic-sites.html",
    "talks/talks.html",
    "talks/report-kitchen-waste.html",
]

def api(method, path, data=None, retries=6, timeout=120):
    url = BASE + path
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, method=method)
            req.add_header("Authorization", f"Bearer {TOKEN}")
            req.add_header("Accept", "application/vnd.github+json")
            req.add_header("User-Agent", "wb-push")
            if data is not None:
                req.add_header("Content-Type", "application/json")
                req.data = json.dumps(data).encode("utf-8")
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if attempt < retries - 1 and e.code >= 500:
                time.sleep(3 * (attempt + 1)); continue
            print("HTTPError", e.code, body); raise
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(3 * (attempt + 1)); continue
            print("Error", repr(e)); raise

br = api("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base_commit", base_commit)

tree_entries = []
for rel in FILES:
    with open(f"{ROOT}/{rel}", "r", encoding="utf-8") as f:
        content = f.read()
    blob = api("POST", "/git/blobs", {"content": content, "encoding": "utf-8"})
    print("blob", rel, blob["sha"])
    tree_entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})

tree = api("POST", "/git/trees", {"base_tree": base_tree, "tree": tree_entries})
commit = api("POST", "/git/commits", {
    "message": "docs: set page last-updated dates to Oct 16, 2026",
    "tree": tree["sha"],
    "parents": [base_commit],
})
ref = api("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref updated:", ref.get("ref"), ref.get("object", {}).get("sha"))
print("DONE")
