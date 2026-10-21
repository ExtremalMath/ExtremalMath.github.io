import json, base64, urllib.request, urllib.error, time

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
BASE = f"https://api.github.com/repos/{OWNER}/{REPO}"

def api(method, path, data=None, retries=6, timeout=300):
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

# base
br = api("GET", "/branches/main")
base_commit = br["commit"]["sha"]
base_tree = br["commit"]["commit"]["tree"]["sha"]
print("base_commit", base_commit)
print("base_tree", base_tree)

# books.html blob (text)
with open(r"D:/Workbuddyworkspace/mywebsite/books.html", "r", encoding="utf-8") as f:
    html_content = f.read()
html_blob = api("POST", "/git/blobs", {"content": html_content, "encoding": "utf-8"})
html_sha = html_blob["sha"]
print("html blob", html_sha)

# PDF blob (base64)
with open(r"D:/Workbuddyworkspace/mywebsite/book/FiniteFields_Applications_FengLiao.pdf", "rb") as f:
    pdf_b64 = base64.b64encode(f.read()).decode("ascii")
print("pdf base64 length", len(pdf_b64))
pdf_blob = api("POST", "/git/blobs", {"content": pdf_b64, "encoding": "base64"})
pdf_sha = pdf_blob["sha"]
print("pdf blob", pdf_sha)

# tree
tree = api("POST", "/git/trees", {
    "base_tree": base_tree,
    "tree": [
        {"path": "books.html", "mode": "100644", "type": "blob", "sha": html_sha},
        {"path": "book/FiniteFields_Applications_FengLiao.pdf", "mode": "100644", "type": "blob", "sha": pdf_sha},
    ],
})
tree_sha = tree["sha"]
print("tree", tree_sha)

# commit
msg = "docs(books): add Finite Fields and Their Applications (Feng & Liao)"
commit = api("POST", "/git/commits", {
    "message": msg,
    "tree": tree_sha,
    "parents": [base_commit],
})
commit_sha = commit["sha"]
print("commit", commit_sha)

# ref
ref = api("PATCH", "/git/refs/heads/main", {"sha": commit_sha, "force": False})
print("ref updated:", ref.get("ref"), ref.get("object", {}).get("sha"))
print("DONE")
