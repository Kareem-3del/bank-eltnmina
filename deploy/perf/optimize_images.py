#!/usr/bin/env python3
"""Shrink the images the site actually references.

Scans frontend/{ar,en}/*.html, frontend/css/*.css and frontend/js/*.js for
`assets/...` raster references, and for every file over MIN_BYTES:

  * resizes it — wide banners (aspect >= 1.3) to at most MAX_WIDE px wide,
    everything else to at most MAX_OTHER px on the long side;
  * re-encodes it as WebP (quality QUALITY, alpha kept);
  * keeps the result only if it is smaller than the original.

PNG/JPEG sources become `<stem>.webp` (or `<stem>-opt.webp` if that name is
taken by a different file); references in HTML/CSS/JS are rewritten and the
original is deleted once nothing points at it. WebP sources are rewritten in
place. Originals stay recoverable from git history.

Run from the repo root:  python3 deploy/perf/optimize_images.py [--dry-run]
"""
import glob
import os
import re
import sys
from urllib.parse import unquote, quote

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend")
MIN_BYTES = 120_000
MAX_WIDE = 2560
MAX_OTHER = 1600
QUALITY = 80
REF_RE = re.compile(r"assets/[^\"'\)\s?#]+?\.(?:png|jpe?g|webp)", re.I)


def source_files():
    pats = ["ar/*.html", "en/*.html", "*.html", "css/*.css", "js/*.js"]
    return [f for p in pats for f in glob.glob(os.path.join(ROOT, p))]


def encode(src, dst):
    im = Image.open(src)
    im.load()
    w, h = im.size
    limit = MAX_WIDE if w / h >= 1.3 else MAX_OTHER
    scale = min(1.0, (MAX_WIDE / w) if w / h >= 1.3 else (limit / max(w, h)))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    has_alpha = im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    tmp = dst + ".tmp.webp"
    im.save(tmp, "WEBP", quality=QUALITY, method=6)
    return tmp, im.size


def main(dry):
    files = source_files()
    texts = {f: open(f, encoding="utf-8").read() for f in files}
    refs = set()
    for s in texts.values():
        refs.update(unquote(m.group(0)) for m in REF_RE.finditer(s))

    renames, saved = {}, 0
    for ref in sorted(refs):
        path = os.path.join(ROOT, ref)
        if not os.path.isfile(path) or os.path.getsize(path) < MIN_BYTES:
            continue
        stem, ext = os.path.splitext(ref)
        new_ref = ref if ext.lower() == ".webp" else stem + ".webp"
        new_path = os.path.join(ROOT, new_ref)
        if new_ref != ref and os.path.exists(new_path):
            new_ref = stem + "-opt.webp"
            new_path = os.path.join(ROOT, new_ref)
        before = os.path.getsize(path)
        tmp, size = encode(path, new_path)
        after = os.path.getsize(tmp)
        if after >= before:
            os.remove(tmp)
            continue
        saved += before - after
        print(f"{before/1e6:6.2f}MB -> {after/1e6:5.2f}MB {size[0]}x{size[1]}  {ref} -> {new_ref}")
        if dry:
            os.remove(tmp)
            continue
        os.replace(tmp, new_path)
        if new_ref != ref:
            renames[ref] = new_ref

    if not dry and renames:
        for f, s in texts.items():
            orig = s
            for old, new in renames.items():
                s = s.replace(old, new).replace(quote(old), quote(new))
            if s != orig:
                open(f, "w", encoding="utf-8").write(s)
        remaining = "".join(open(f, encoding="utf-8").read() for f in files)
        for old in renames:
            if old not in remaining and quote(old) not in remaining:
                os.remove(os.path.join(ROOT, old))

    print(f"\nsaved {saved/1e6:.1f} MB across referenced images" + (" (dry run)" if dry else ""))


if __name__ == "__main__":
    main("--dry-run" in sys.argv)
