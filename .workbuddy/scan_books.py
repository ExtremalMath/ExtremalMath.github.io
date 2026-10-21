# scan_books.py — read every PDF in book/ and dump metadata + first pages (local tool, never pushed)
import os, sys
from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "book")

files = sorted(f for f in os.listdir(BOOK) if f.lower().endswith(".pdf"))
print(f"PDF files found: {len(files)}\n")

for f in files:
    p = os.path.join(BOOK, f)
    size = os.path.getsize(p)
    mt = os.path.getmtime(p)
    import datetime
    mts = datetime.datetime.fromtimestamp(mt).strftime("%Y-%m-%d %H:%M")
    print("=" * 78)
    print(f"FILE      : {f}")
    print(f"SIZE      : {size} bytes ({size/1048576:.2f} MB)   MTIME: {mts}")
    try:
        r = PdfReader(p)
        print(f"PAGES     : {len(r.pages)}")
        md = r.metadata or {}
        for k in ("/Title", "/Author", "/Subject", "/Creator", "/Producer", "/CreationDate", "/ModDate"):
            if md.get(k):
                print(f"META {k}: {md[k]}")
        print("--- first page text (trimmed) ---")
        for i in range(min(2, len(r.pages))):
            t = (r.pages[i].extract_text() or "").strip()
            t = "\n".join(line for line in t.splitlines() if line.strip())
            print(f"[page {i+1}]")
            print(t[:1400] if t else "(no text layer)")
            print()
    except Exception as e:
        print(f"ERROR: {e}")
print("=" * 78)
print("SCAN DONE")
