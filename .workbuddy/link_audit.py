#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站超链接审计工具（本地，不推送）。
覆盖：HTML href/src + CSS url()；Markdown [..](..)；JS 中的 http(s) 外部 URL。
分类：anchor(#) / external(http/https///) / mailto/tel/data/javascript / relative。
验证：relative -> 文件存在性；external -> HTTP 状态（HEAD 失败回退 GET，超时标记 unverified）。
"""
import os, re, sys, json, urllib.parse, urllib.request, ssl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', '.workbuddy', 'node_modules'}

html_files, js_files, md_files = [], [], []
for dp, dns, fns in os.walk(ROOT):
    dns[:] = [d for d in dns if d not in SKIP_DIRS]
    for f in fns:
        p = os.path.join(dp, f)
        if f.endswith('.html'): html_files.append(p)
        elif f.endswith('.js'): js_files.append(p)
        elif f.endswith('.md'): md_files.append(p)

html_attr_re = re.compile(r'''(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
css_url_re   = re.compile(r'''url\(\s*["']?([^"')]+)["']?\s*\)''', re.I)
md_link_re   = re.compile(r'\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
raw_http_re  = re.compile(r'https?://[^\s"\'\)<>\]}]+')

def rel(p): return os.path.relpath(p, ROOT).replace(os.sep, '/')

raw = []  # (file, link, kind)
for f in html_files:
    t = open(f, encoding='utf-8', errors='ignore').read()
    for m in html_attr_re.findall(t): raw.append((f, m.strip(), 'html-attr'))
    for m in css_url_re.findall(t):   raw.append((f, m.strip(), 'css-url'))
for f in md_files:
    t = open(f, encoding='utf-8', errors='ignore').read()
    for m in md_link_re.findall(t):   raw.append((f, m.strip(), 'md'))
for f in js_files:
    t = open(f, encoding='utf-8', errors='ignore').read()
    for m in raw_http_re.findall(t):  raw.append((f, m.strip(), 'js-http'))

# 去重
seen, uniq = set(), []
for r in raw:
    key = (r[0], r[1], r[2])
    if key in seen: continue
    seen.add(key); uniq.append(r)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def classify(link):
    if link.startswith('#'): return 'anchor'
    if link.startswith('mailto:'): return 'mailto'
    if link.startswith('tel:'): return 'tel'
    if link.startswith('data:'): return 'data'
    if link.startswith('javascript:'): return 'javascript'
    if link.startswith('//'): return 'external'
    if link.startswith(('http://', 'https://')): return 'external'
    return 'relative'

def validate_external(url):
    try:
        req = urllib.request.Request(url, method='HEAD',
                                    headers={'User-Agent': 'Mozilla/5.0 link-audit'})
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        return ('OK', resp.status)
    except urllib.error.HTTPError as e:
        # try GET fallback for servers that reject HEAD
        try:
            req = urllib.request.Request(url, method='GET',
                                        headers={'User-Agent': 'Mozilla/5.0 link-audit'})
            resp = urllib.request.urlopen(req, timeout=10, context=ctx)
            return ('OK', resp.status)
        except urllib.error.HTTPError as e2:
            return ('ERROR', e2.code)
        except Exception as e2:
            return ('UNVERIFIED', str(e2)[:60])
    except Exception as e:
        return ('UNVERIFIED', str(e)[:60])

def resolve_relative(file, link):
    base = os.path.dirname(file)
    pathpart = link.split('#')[0].split('?')[0]
    if not pathpart:
        return None  # pure anchor / query on same page
    pathpart = urllib.parse.unquote(pathpart)
    if pathpart.startswith('/'):
        resolved = os.path.normpath(os.path.join(ROOT, pathpart.lstrip('/')))
    else:
        resolved = os.path.normpath(os.path.join(base, pathpart))
    return resolved

records = []
for f, link, kind in sorted(uniq, key=lambda x: (rel(x[0]), x[2], x[1])):
    cat = classify(link)
    rec = {'file': rel(f), 'link': link, 'kind': kind, 'category': cat}
    if cat == 'relative':
        r = resolve_relative(f, link)
        if r is None:
            rec['status'] = 'SAME-PAGE-ANCHOR'
        elif os.path.exists(r):
            rec['status'] = 'OK'
            rec['resolves'] = rel(r)
        else:
            rec['status'] = 'DEAD'
            rec['resolves'] = rel(r)
    elif cat == 'external':
        st, code = validate_external(link)
        rec['status'] = st
        rec['http'] = code
    else:
        rec['status'] = 'NON-HTTP'
    records.append(rec)

# 汇总
by_cat = {}
for r in records:
    by_cat.setdefault(r['category'], 0)
    by_cat[r['category']] += 1

dead = [r for r in records if r['status'] == 'DEAD']
ext_err = [r for r in records if r['status'] == 'ERROR']
ext_unv = [r for r in records if r['status'] == 'UNVERIFIED']

print("="*78)
print("全站超链接审计  (扫描目录: %s)" % ROOT)
print("="*78)
print("扫描文件: HTML %d / JS %d / MD %d" % (len(html_files), len(js_files), len(md_files)))
print("链接总数(去重): %d" % len(records))
print("按类别:")
for k, v in sorted(by_cat.items()):
    print("   %-12s %d" % (k, v))

print("\n--- 内部相对链接校验 ---")
rel_recs = [r for r in records if r['category'] == 'relative']
dead_rel = [r for r in rel_recs if r['status'] == 'DEAD']
print("内部相对链接: %d, 其中 DEAD: %d" % (len(rel_recs), len(dead_rel)))
for r in dead_rel:
    print("  [DEAD] %s -> %s  (resolves: %s)" % (r['file'], r['link'], r.get('resolves')))

print("\n--- 外部链接校验 ---")
ext_recs = [r for r in records if r['category'] == 'external']
print("外部链接: %d" % len(ext_recs))
for r in ext_recs:
    print("  [%s] %s  (%s)" % (r['status'], r['link'], r['file']))

print("\n--- 非 HTTP (anchor/mailto/...) 统计 ---")
for r in records:
    if r['category'] not in ('relative', 'external'):
        pass
nonhttp = [r for r in records if r['category'] not in ('relative', 'external')]
from collections import Counter
c = Counter(r['category'] for r in nonhttp)
for k, v in c.items():
    print("   %-12s %d" % (k, v))

print("\n--- 结论 ---")
if not dead_rel and not ext_err:
    print("✅ 无死链 (DEAD=0)；外部链接全部可达或仅网络未验证(UNVERIFIED)。")
else:
    print("⚠️ 存在问题链接: DEAD=%d, ERROR=%d, UNVERIFIED=%d" % (len(dead_rel), len(ext_err), len(ext_unv)))

# 写出 JSON 供报告生成
out = {'total': len(records), 'by_category': by_cat,
       'dead': dead_rel, 'external_error': ext_err, 'external_unverified': ext_unv,
       'records': records}
with open(os.path.join(os.path.dirname(__file__), 'link_audit_result.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, indent=2)
print("\n详细结果已写入 .workbuddy/link_audit_result.json")
