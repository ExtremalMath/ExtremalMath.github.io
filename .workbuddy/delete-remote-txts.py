# -*- coding: utf-8 -*-
"""One-shot: remove style-guide.txt / push-rules.txt / troubleshooting.txt from remote
via Git Data API (tree rebuild -> commit -> PATCH ref), keep local files untouched.
"""
import json
import os
import sys
import urllib.request
import urllib.error

API = "https://api.github.com/repos/ExtremalMath/ExtremalMath.github.io"
TO_DELETE = {"style-guide.txt", "push-rules.txt", "troubleshooting.txt"}

cfg = json.load(open(os.path.expanduser("~/.workbuddy/github-auto-upload/config.json"), encoding="utf-8"))
TOKEN = cfg["token"]

def call(method, path, body=None):
    url = API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8") or "{}")

# 1. current HEAD
st, ref = call("GET", "/git/refs/heads/main")
if st != 200:
    print("FAIL get ref:", st, ref); sys.exit(1)
head_sha = ref["object"]["sha"]
print("HEAD:", head_sha)

# 2. commit -> tree
st, commit = call("GET", "/git/commits/" + head_sha)
tree_sha = commit["tree"]["sha"]
print("tree:", tree_sha)

# 3. recursive tree, filter out targets
st, tree = call("GET", "/git/trees/" + tree_sha + "?recursive=1")
entries = [t for t in tree["tree"] if t["path"] not in TO_DELETE]
removed = [t["path"] for t in tree["tree"] if t["path"] in TO_DELETE]
print("removing from remote:", removed)
print("entries before: %d, after: %d" % (len(tree["tree"]), len(entries)))

# sanity: only remove targets that are actually present (style-guide.txt already
# removed remotely by a parallel round; assert it is absent)
assert removed == sorted([p for p in TO_DELETE if p in removed]), removed
absent = TO_DELETE - set(removed)
if absent:
    print("already absent on remote (skipped):", sorted(absent))

new_entries = [{"path": t["path"], "mode": t["mode"], "type": t["type"], "sha": t["sha"]}
               for t in entries]

# 4. build new tree (full listing; field name MUST be "tree")
st, new_tree = call("POST", "/git/trees", {"tree": new_entries})
if st != 201:
    print("FAIL create tree:", st, new_tree); sys.exit(1)
new_tree_sha = new_tree["sha"]
print("new tree:", new_tree_sha)

# 5. commit
st, new_commit = call("POST", "/git/commits", {
    "message": "Remove internal rule docs from remote (txt files stay local only)",
    "tree": new_tree_sha,
    "parents": [head_sha],
})
if st != 201:
    print("FAIL create commit:", st, new_commit); sys.exit(1)
new_head = new_commit["sha"]
print("new commit:", new_head)

# 6. PATCH ref (fast-forward, force=False)
st, patched = call("PATCH", "/git/refs/heads/main", {"sha": new_head, "force": False})
if st != 200:
    print("FAIL patch ref:", st, patched); sys.exit(1)
print("ref updated to:", patched["object"]["sha"])

# 7. verify: recursive tree again
st, vtree = call("GET", "/git/trees/" + patched["object"]["sha"] + "?recursive=1")
left = [t["path"] for t in vtree["tree"] if t["path"].endswith(".txt")]
print("VERIFY txt on remote now:", left)
assert not (set(left) & TO_DELETE), "targets still on remote!"
print("DONE")
