import json, base64, urllib.request, urllib.error, time

OWNER = "ExtremalMath"
REPO = "ExtremalMath.github.io"
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
BASE = f"https://api.github.com/repos/{OWNER}/{REPO}"
ROOT = r"D:/Workbuddyworkspace/mywebsite"

# new files (local -> github path)
NEW = [
    (r"code/c_language/data_structure/ticket_system.cpp",
     "code/c_language/data_structure/ticket_system.cpp"),
    (r"code/c_language/data_structure/tour_map.cpp",
     "code/c_language/data_structure/tour_map.cpp"),
    (r"code/c_language/data_structure/twenty_four_game.cpp",
     "code/c_language/data_structure/twenty_four_game.cpp"),
    (r"code/c_language/data_structure/huffman_player_names.cpp",
     "code/c_language/data_structure/huffman_player_names.cpp"),
]
# old paths to delete (sha null)
OLD = [
    "code/c语言/data_structure/ticket_system.cpp",
    "code/c语言/data_structure/tour_map.cpp",
    "code/c语言/data_structure/twenty_four_game.cpp",
    "code/c语言/data_structure/huffman_player_names.cpp",
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

entries = []
for local, gh in NEW:
    with open(f"{ROOT}/{local}", "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    blob = api("POST", "/git/blobs", {"content": b64, "encoding": "base64"})
    print("blob", gh, blob["sha"])
    entries.append({"path": gh, "mode": "100644", "type": "blob", "sha": blob["sha"]})

# deletions: sha null removes the entry from the tree
for old in OLD:
    entries.append({"path": old, "mode": "100644", "type": "blob", "sha": None})
    print("delete", old)

tree = api("POST", "/git/trees", {"base_tree": base_tree, "tree": entries})
commit = api("POST", "/git/commits", {
    "message": "refactor(code): rename Chinese folder c语言 to c_language",
    "tree": tree["sha"],
    "parents": [base_commit],
})
ref = api("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
print("ref updated:", ref.get("ref"), ref.get("object", {}).get("sha"))
print("DONE")
