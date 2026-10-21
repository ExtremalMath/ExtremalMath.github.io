import json, time, urllib.request, urllib.error

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
            raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()[:600]}")
        except Exception as e:
            last = e; time.sleep(2 * (i + 1))
    raise RuntimeError(f"{method} {path} failed: {last}")

# 1) current remote state
br = req("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base_commit:", base_commit)

t = req("GET", f"/git/trees/{base_tree}?recursive=1")
print("truncated:", t.get("truncated"))
files = [e for e in t["tree"] if e["type"] == "blob"]
before = {e["path"]: e["sha"] for e in files}
print("remote blobs before:", len(before))

TARGET = ".github/workflows/sync-from-gitee.yml"
if TARGET not in before:
    raise SystemExit("target file not found in remote tree - abort")
del before[TARGET]

# 2) full tree rebuild (deletion = omission)
entries = [{"path": p, "mode": "100644", "type": "blob", "sha": sha}
           for p, sha in sorted(before.items())]
tree = req("POST", "/git/trees", {"tree": entries})
print("new_tree:", tree["sha"], "entries:", len(entries))

# 3) commit (fast-forward from base_commit)
commit = req("POST", "/git/commits", {
    "message": "chore(ci): remove sync-from-gitee.yml (broken force-overwrite workflow, per plan A)",
    "parents": [base_commit],
    "tree": tree["sha"],
})
print("new_commit:", commit["sha"])

# 4) move ref, force=False
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref:", ref["ref"], "->", ref["object"]["sha"])
print("PUSH OK")
