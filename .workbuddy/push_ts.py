# -*- coding: utf-8 -*-
import base64, json, time, os, urllib.request, urllib.error
OWNER="ExtremalMath"; REPO="ExtremalMath.github.io"
TOKEN=json.load(open(r"C:/Users/video/.workbuddy/github-auto-upload/config.json"))["token"]
ROOT=r"D:/Workbuddyworkspace/mywebsite"
ADD=["troubleshooting.txt"]
MSG="Update troubleshooting.txt with CV push notes"
def req(m,p,d=None):
    u=f"https://api.github.com/repos/{OWNER}/{REPO}"+p
    b=json.dumps(d).encode() if d is not None else None
    r=urllib.request.Request(u,data=b,method=m)
    r.add_header("Authorization",f"Bearer {TOKEN}"); r.add_header("User-Agent","wb"); r.add_header("Accept","application/vnd.github+json")
    if b: r.add_header("Content-Type","application/json")
    for a in range(6):
        try:
            with urllib.request.urlopen(r,timeout=120) as resp: return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if a==5: raise RuntimeError(f"{m} {p} -> {e.code} {e.read().decode('utf-8','ignore')[:200]}")
            time.sleep(5)
        except Exception as e:
            if a==5: raise
            time.sleep(5)
br=req("GET","/branches/main"); bc=br["commit"]["sha"]; bt=br["commit"]["commit"]["tree"]["sha"]
print("base:",bc[:10])
entries=[]
for rel in ADD:
    raw=open(os.path.join(ROOT,rel.replace("/",os.sep)),"rb").read()
    bb=req("POST","/git/blobs",{"content":base64.b64encode(raw).decode("ascii"),"encoding":"base64"})
    entries.append({"path":rel,"mode":"100644","type":"blob","sha":bb["sha"]})
    print("  blob ok:",rel,len(raw),"bytes")
tree=req("POST","/git/trees",{"base_tree":bt,"tree":entries})
commit=req("POST","/git/commits",{"message":MSG,"tree":tree["sha"],"parents":[bc]})
ref=req("PATCH","/git/refs/heads/main",{"sha":commit["sha"],"force":False})
print("PUSH OK:",commit["sha"])
