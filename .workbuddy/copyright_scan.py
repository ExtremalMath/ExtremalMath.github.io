# copyright_scan.py — pull copyright/verso pages for publication years (local tool, never pushed)
import os
from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "book")

targets = {
    "2_Evans_Partial Differential Equations_第二版.pdf": [3, 4, 5],
    "royden_real_analysis.pdf": [3, 4, 5],
    "GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf": [3, 4, 5],
}

for f, pages in targets.items():
    p = os.path.join(BOOK, f)
    r = PdfReader(p)
    print("=" * 70)
    print(f)
    for i in pages:
        try:
            t = (r.pages[i-1].extract_text() or "").strip()
        except Exception as e:
            t = f"(error {e})"
        t = " ".join(t.split())
        print(f"[p{i}] {t[:600] if t else '(no text layer)'}")
