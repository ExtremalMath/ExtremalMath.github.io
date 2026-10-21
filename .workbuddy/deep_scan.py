# deep_scan.py — probe scattered pages of the two Feng/Liao PDFs for any text layer (local tool, never pushed)
import os
from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "book")

for f in ["FiniteFields_Applications_FengLiao.pdf"]:
    p = os.path.join(BOOK, f)
    r = PdfReader(p)
    n = len(r.pages)
    print(f"{f}: {n} pages")
    probes = [1, 2, 3, 4, 5, 8, 12, 20, 40, 80, 150, 250, 350, n]
    seen = set()
    for i in probes:
        if i < 1 or i > n or i in seen:
            continue
        seen.add(i)
        try:
            t = (r.pages[i-1].extract_text() or "").strip()
        except Exception as e:
            t = f"(error {e})"
        t = " ".join(t.split())
        print(f"  p{i}: {t[:220] if t else '(no text layer)'}")
