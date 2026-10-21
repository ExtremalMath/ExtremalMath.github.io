import json, base64, time, urllib.request, urllib.error, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
OWNER, REPO = "ExtremalMath", "ExtremalMath.github.io"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"

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
    raise RuntimeError(f"{method} {path} failed after retries: {last}")

# 1) base commit + full recursive file map {path: blob_sha}
br = req("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base_commit:", base_commit)
t = req("GET", f"/git/trees/{base_tree}?recursive=1")
print("truncated  :", t.get("truncated"))
file_map = {e["path"]: e["sha"] for e in t["tree"] if e["type"] == "blob"}
print("existing blobs:", len(file_map))

# 2) deletions: drop these paths from the map
deletes = [
    "materials.html", "homework.html", "course-essay.html", "notes.html",
    "books.html", "academic-sites.html", "research-log.html", "PowerPiontPre.pdf",
    "blankk.html", "book/t.txt",
    "book/GTM 244 - ISBN978-1-84628-969-9 - Bondy J.A., Murty U.S.R. - Graph Theory.pdf",
    "book/GTM244BondyJAMurtyUSR-GraphTheory.pdf",
]
for p in deletes:
    if p in file_map:
        del file_map[p]; print("delete    :", p)
    else:
        print("WARN not in tree:", p)

# 3) additions/updates: create blobs, set into map
def add_blob_text(p):
    with open(os.path.join(ROOT, p), "rb") as f:
        raw = f.read()
    sha = req("POST", "/git/blobs", {"content": raw.decode("utf-8"), "encoding": "utf-8"})["sha"]
    file_map[p] = sha; print("blob(text):", p)

def add_blob_b64(p):
    with open(os.path.join(ROOT, p), "rb") as f:
        raw = f.read()
    sha = req("POST", "/git/blobs", {"content": base64.b64encode(raw).decode(), "encoding": "base64"})["sha"]
    file_map[p] = sha; print("blob(pdf) :", p, len(raw), "bytes")

for p in ["index.html", "about.html", "teaching.html",
          "study/materials.html", "study/homework.html", "study/course-essay.html",
          "study/notes.html", "study/books.html", "study/academic-sites.html",
          "research/research-log.html"]:
    add_blob_text(p)
add_blob_b64("talks/PowerPiontPre.pdf")

# 4) build COMPLETE tree (no base_tree) -> deletions are simply absent
entries = [{"path": p, "mode": "100644", "type": "blob", "sha": sha}
           for p, sha in sorted(file_map.items())]
tree = req("POST", "/git/trees", {"tree": entries})
print("new_tree  :", tree["sha"], "entries:", len(entries))

# 5) commit + move ref
commit = req("POST", "/git/commits", {
    "message": "refactor: group material pages into study/, move research-log into research/, move talk PDF into talks/, clean up duplicates/junk (teaching kept at root)",
    "parents": [base_commit],
    "tree": tree["sha"],
})
print("new_commit:", commit["sha"])
ref = req("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref       :", ref["ref"], "->", ref["object"]["sha"])
print("PUSH OK")
