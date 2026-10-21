# -*- coding: utf-8 -*-
import json
import urllib.request
import urllib.error

OWNER, REPO = "ExtremalMath", "ExtremalMath.github.io"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"
BASE = "https://extremalmath.github.io"

# 1) Pages 构建状态
try:
    req = urllib.request.Request(f"{API}/pages",
                                 headers={"Accept": "application/vnd.github+json",
                                           "User-Agent": "verify"})
    with urllib.request.urlopen(req, timeout=30) as r:
        p = json.loads(r.read().decode("utf-8", "replace"))
        print("PAGES status:", p.get("status"), "| build:", (p.get("build") or {}).get("status"))
except Exception as e:  # noqa
    print("PAGES check error:", e)

# 2) 关键 URL 状态码
urls = [
    BASE + "/",
    BASE + "/study/competition.html",
    BASE + "/study/books.html",
    BASE + "/study/materials.html",
    BASE + "/book/gtm_244_bondy_murty_graph_theory.pdf",            # 新路径，期望 200
    BASE + "/book/GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf",        # 旧路径，期望 404
    BASE + "/notes/GraphTheoryHomework/Exercise0526.pdf",           # 旧路径，期望 404
    BASE + "/notes/graph_theory_homework/exercise_0526.pdf",        # 新路径，期望 200
    BASE + "/code/cpp/keep.cpp",                                    # 新路径，期望 200
    BASE + "/code/c_language/keep.cpp",                             # 旧路径，期望 404
]
for u in urls:
    try:
        with urllib.request.urlopen(u, timeout=30) as r:
            print(r.status, u)
    except urllib.error.HTTPError as e:
        print(e.code, u)
    except Exception as e:  # noqa
        print("ERR", e, u)
