import os, hashlib, json, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
API = "https://api.github.com/repos/ExtremalMath/ExtremalMath.github.io"
EXCLUDE_DIRS = {".git", ".workbuddy"}

def api(path, retries=5):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(API + path)
            req.add_header("Authorization", f"Bearer {TOKEN}")
            req.add_header("User-Agent", "wb")
            return json.loads(urllib.request.urlopen(req, timeout=60).read())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"{path} -> {e.code}")
        except Exception as e:
            last = e; time.sleep(2)
    raise RuntimeError(last)

def blob_sha(path):
    with open(path, "rb") as f:
        data = f.read()
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()

# ---------- 1) 本地文件枚举 + 完整性 ----------
print("=== 1) LOCAL INTEGRITY ===")
local = {}
problems = []
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in EXCLUDE_DIRS]
    for f in fn:
        p = os.path.join(dp, f)
        rel = os.path.relpath(p, ROOT).replace("\\", "/")
        try:
            size = os.path.getsize(p)
            if size == 0:
                problems.append(f"EMPTY: {rel}")
            with open(p, "rb") as fh:
                head = fh.read(5)
            if f.lower().endswith(".pdf") and not head.startswith(b"%PDF"):
                problems.append(f"BAD PDF MAGIC: {rel}")
            if f.lower().endswith(".html") and b"<html" not in open(p, "rb").read(2000):
                problems.append(f"HTML MISSING <html>: {rel}")
            local[rel] = {"sha": blob_sha(p), "size": size}
        except Exception as e:
            problems.append(f"UNREADABLE {rel}: {e}")
print(f"files scanned: {len(local)}")
print("integrity problems:", problems if problems else "NONE")

# ---------- 2) 变更检测 vs 远端 ----------
print("\n=== 2) CHANGE DETECTION (local vs remote main) ===")
br = api("/branches/main")
HEAD = br["commit"]["sha"]
c = api(f"/git/commits/{HEAD}")
t = api(f"/git/trees/{c['tree']['sha']}?recursive=1")
remote = {e["path"]: (e["sha"], e.get("size")) for e in t["tree"] if e["type"] == "blob"}
print("remote HEAD:", HEAD)
local_only = sorted(set(local) - set(remote))
remote_only = sorted(set(remote) - set(local))
diff = sorted(p for p in set(local) & set(remote) if local[p]["sha"] != remote[p][0])
print("local-only (not in remote):", local_only if local_only else "NONE")
print("remote-only (not in local):", remote_only if remote_only else "NONE")
print("sha-mismatch (both sides differ):", diff if diff else "NONE")

# ---------- 3) 配置一致性 ----------
print("\n=== 3) CONFIG CONSISTENCY ===")
gh = os.path.join(ROOT, ".github")
wf_files = []
for dp, dn, fn in os.walk(gh):
    for f in fn:
        wf_files.append(os.path.relpath(os.path.join(dp, f), ROOT).replace("\\", "/"))
print(".github files:", wf_files)
print("target file exists:", ".github/workflows/sync-from-gitee.yml" in wf_files)
# no references to the workflow from site content
import subprocess
refs = []
for p in local:
    if p.endswith((".html", ".js")):
        try:
            txt = open(os.path.join(ROOT, p), encoding="utf-8", errors="ignore").read()
            if "sync-from-gitee" in txt or "GITSYNC" in txt:
                refs.append(p)
        except Exception:
            pass
print("site files referencing workflow:", refs if refs else "NONE")
pg = api("/pages")
print("Pages source:", pg.get("source"), "| status:", pg.get("status"))

# ---------- 4) 错误扫描 ----------
print("\n=== 4) ERROR SCAN ===")
# JS syntax
js_files = sorted(f for f in os.listdir(ROOT) if f.endswith(".js"))
for jf in js_files:
    r = subprocess.run(
        [r"C:/Users/video/.workbuddy/binaries/node/versions/22.22.2-6/node.exe", "--check", jf],
        cwd=ROOT, capture_output=True, text=True)
    print(f"node --check {jf}:", "PASS" if r.returncode == 0 else f"FAIL {r.stderr[:200]}")
# link check
r2 = subprocess.run(
    [r"C:/Users/video/.workbuddy/binaries/python/versions/3.13.12/python.exe", ".workbuddy/check_links.py"],
    cwd=ROOT, capture_output=True, text=True)
print("link check:", "PASS (0 broken)" if "No broken internal links" in r2.stdout else f"FAIL\n{r2.stdout[-500:]}")
