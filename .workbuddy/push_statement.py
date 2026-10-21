import json, time, urllib.request, urllib.error, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
API = "https://api.github.com/repos/ExtremalMath/ExtremalMath.github.io"

def req(method, path, data=None, retries=6):
    body = None if data is None else json.dumps(data).encode()
    last = None
    for i in range(retries):
        try:
            r = urllib.request.Request(API + path, data=body, method=method)
            r.add_header("Authorization", f"Bearer {TOKEN}")
            r.add_header("User-Agent", "wb")
            if body is not None:
                r.add_header("Content-Type", "application/json")
            resp = urllib.request.urlopen(r, timeout=90)
            return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()[:800]}")
        except Exception as e:
            last = e; time.sleep(2 * (i + 1))
    raise RuntimeError(f"{method} {path} failed: {last}")

br = req("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base_commit:", base_commit)

entries = []
for p in ["statement.html", "teaching.html"]:
    with open(os.path.join(ROOT, p), "rb") as f:
        raw = f.read()
    sha = req("POST", "/git/blobs", {"content": raw.decode("utf-8"), "encoding": "utf-8"})["sha"]
    entries.append({"path": p, "mode": "100644", "type": "blob", "sha": sha})
    print("blob:", p, len(raw), "bytes")

tree = req("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
print("new_tree:", tree["sha"])

commit = req("POST", "/git/commits", {
    "message": "fix: upload statement.html (was missing -> 404); teaching.html placeholder",
    "parents": [base_commit],
    "tree": tree["sha"],
})
print("new_commit:", commit["sha"])

ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref:", ref["ref"], "->", ref["object"]["sha"])
print("PUSH OK")
