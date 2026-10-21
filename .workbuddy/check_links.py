import os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if any(p in dirpath for p in ['.git', '.workbuddy']):
        continue
    for f in filenames:
        if f.endswith('.html'):
            html_files.append(os.path.join(dirpath, f))

link_re = re.compile(r'''(?:href|src)\s*=\s*["']([^"']+)["']''', re.IGNORECASE)

broken = []
checked = 0
for hf in html_files:
    base = os.path.dirname(hf)
    with open(hf, encoding='utf-8', errors='ignore') as fh:
        txt = fh.read()
    for m in link_re.findall(txt):
        target = m.strip()
        if not target:
            continue
        if target.startswith(('#', 'http://', 'https://', '//', 'mailto:', 'data:', 'javascript:')):
            continue
        # strip query / fragment
        pathpart = target.split('#')[0].split('?')[0]
        if not pathpart:
            continue
        # decode percent-encoding (spaces and non-ASCII file names are written encoded)
        pathpart = urllib.parse.unquote(pathpart)
        if pathpart.startswith('/'):
            # Site-root-absolute path (e.g. used by root 404.html on GitHub Pages).
            # Strip the leading slash and resolve against the site ROOT.
            resolved = os.path.normpath(os.path.join(ROOT, pathpart.lstrip('/')))
        else:
            resolved = os.path.normpath(os.path.join(base, pathpart))
        checked += 1
        if not (os.path.exists(resolved)):
            rel = os.path.relpath(hf, ROOT)
            broken.append((rel, target, os.path.relpath(resolved, ROOT)))

print(f"HTML files scanned : {len(html_files)}")
print(f"Relative links check: {checked}")
if broken:
    print("BROKEN LINKS:")
    for rel, tgt, res in broken:
        print(f"  [{rel}] -> {tgt}  (resolves to: {res})")
else:
    print("No broken internal links found. OK")

# Also verify no kept page still references the files we plan to delete
print("\n--- references to to-be-deleted files ---")
del_targets = ['blankk.html',
               'book/GTM 244 - ISBN978-1-84628-969-9 - Bondy J.A., Murty U.S.R. - Graph Theory.pdf',
               'book/GTM244BondyJAMurtyUSR-GraphTheory.pdf',
               'book/t.txt']
allhref = []
for hf in html_files:
    with open(hf, encoding='utf-8', errors='ignore') as fh:
        allhref.extend(link_re.findall(fh.read()))
for d in del_targets:
    hits = [h for h in allhref if d in h]
    print(f"  {d}: {len(hits)} reference(s)")
