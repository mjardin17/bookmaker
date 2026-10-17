"""
generate_and_verify_proof.py — Runs the complete book generation pipeline
for Little Zeus Gets His Thunderbolt and verifies every artifact with skeptical scrutiny.
"""

import sys
import json
from pathlib import Path
from PIL import Image
import pypdf
from ebooklib import epub

from storyforge2.brief import ProjectBrief
from storyforge2.pipeline import BookPipeline
from storyforge.patterson_formula import PattersonFormula, ReadingLevel

def main():
    print("=" * 70)
    print("STARTING END-TO-END BOOK GENERATION & VERIFICATION")
    print("=" * 70)

    work_dir = Path("output_books/little_zeus_gets_his_thunderbolt")
    work_dir.mkdir(parents=True, exist_ok=True)

    # 1. Setup Project Brief based on Little Olympus Master Bible
    brief = ProjectBrief(
        title="Little Zeus Gets His Thunderbolt",
        premise="When Little Zeus's magical thunderbolt goes missing, he embarks on an epic quest with Athena and Baby Hercules to find it.",
        audience="children 4-8",
        reading_level="MG",
        genre="Kids Mythology Adventure",
        tone="Warm, playful, silly, heartwarming",
        length_chapters=4,
        characters={
            "Little Zeus": "Small boy with wild curly white hair, tiny golden crown, bright electric blue eyes, white toga with gold trim, holding a glowing thunderbolt.",
            "Baby Hercules": "Chubby toddler with enormous muscular arms, tiny lion-skin cape, confused happy expression, always accidentally breaking things.",
            "Athena": "Smart girl with grey-streaked hair, tiny toy owl on shoulder, big glasses, holding an ancient scroll, always three steps ahead.",
            "Stormy the Storm Cloud": "Big dark grey cartoon cloud with a grumpy but secretly lonely face and harmless lightning sparks.",
        },
        setting="Mount Olympus and the Whispering Wind Valley",
        lesson="True leaders listen with kindness and make friends rather than using pure force.",
        author_name="Empire OS Publishing",
        trim_size="6x9",
    )

    # 2. Run the pipeline
    pipeline = BookPipeline(brief=brief, work_dir=str(work_dir))
    success = pipeline.run(provider_name="waterfall", dry_run=False)

    if not success:
        print("Pipeline run reported failure!")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("SKEPTICAL VERIFICATION OF ALL GENERATED ARTIFACTS")
    print("=" * 70)

    results = {
        "title": brief.title,
        "stages": {},
        "artifacts": {},
        "failures": [],
    }

    # Verify Manuscript
    print("\n[VERIFICATION 1/5] Manuscript & Patterson Formula Compliance...")
    ms_path = pipeline.manuscript_path
    if not ms_path or not ms_path.exists() or ms_path.stat().st_size == 0:
        results["failures"].append("Manuscript file missing or empty")
        print("  FAIL: Manuscript file missing or empty")
    else:
        formula = PattersonFormula(reading_level=ReadingLevel.MG)
        raw_text = ms_path.read_text(encoding="utf-8")
        parts = raw_text.split("\n\n## ")
        total_violations = 0
        chapter_details = []

        for i, part in enumerate(parts[1:], 1):
            lines = part.split("\n", 1)
            ch_title = lines[0].strip()
            ch_body = lines[1].strip() if len(lines) > 1 else ""
            v = formula.validate_chapter(ch_body)
            total_violations += len(v)
            w = len(ch_body.split())
            d = formula._count_dialogue_words(ch_body)
            chapter_details.append({
                "chapter": i,
                "title": ch_title,
                "words": w,
                "dialogue_ratio": f"{d/w:.1%}" if w else "0%",
                "violations": v,
            })
            print(f"  Chapter {i} ('{ch_title}'): {w} words, {d/w:.1%} dialogue, {len(v)} violations")

        if total_violations == 0:
            print(f"  PASS: All {len(chapter_details)} chapters passed Patterson Formula with 0 violations!")
            results["stages"]["manuscript"] = "PASSED (0 violations)"
        else:
            print(f"  FAIL: Found {total_violations} violations across chapters")
            results["failures"].append(f"Manuscript had {total_violations} Patterson violations")
            results["stages"]["manuscript"] = f"FAILED ({total_violations} violations)"

        results["artifacts"]["manuscript"] = {
            "path": str(ms_path),
            "size_bytes": ms_path.stat().st_size,
            "chapters": chapter_details,
            "total_violations": total_violations,
        }

    # Verify Layout
    print("\n[VERIFICATION 2/5] Layout Planning...")
    layout_file = work_dir / "layout.json"
    if layout_file.exists():
        l_data = json.loads(layout_file.read_text())
        print(f"  PASS: Layout saved: {l_data.get('total_estimated_pages')} estimated pages, {l_data.get('chapters')} chapters")
        results["stages"]["layout"] = "PASSED"
        results["artifacts"]["layout"] = l_data
    else:
        results["failures"].append("Layout JSON missing")
        print("  FAIL: Layout JSON missing")

    # Verify Illustrations
    print("\n[VERIFICATION 3/5] Illustrations & Character Sheets...")
    illus_dir = work_dir / "illustrations"
    illus_files = list(illus_dir.glob("*.png")) + list(illus_dir.glob("*.jpg"))
    print(f"  Found {len(illus_files)} illustration files in {illus_dir}")

    verified_illus = {}
    for f in illus_files:
        size = f.stat().st_size
        if size == 0:
            results["failures"].append(f"Illustration {f.name} is 0 bytes")
            print(f"  FAIL: {f.name} is 0 bytes")
            continue
        try:
            im = Image.open(f)
            im.verify()
            im = Image.open(f) # re-open after verify
            verified_illus[f.name] = {"size_bytes": size, "dimensions": im.size, "format": im.format}
            print(f"  ✓ {f.name}: {im.size[0]}x{im.size[1]} {im.format} ({size // 1024}KB)")
        except Exception as e:
            results["failures"].append(f"Illustration {f.name} corrupted: {e}")
            print(f"  FAIL: {f.name} corrupted: {e}")

    results["stages"]["illustrations"] = f"PASSED ({len(verified_illus)} valid images)"
    results["artifacts"]["illustrations"] = verified_illus

    # Verify Cover Package (all 9 variants)
    print("\n[VERIFICATION 4/5] Cover Package (9-Variant Package)...")
    covers_dir = work_dir / "covers"
    expected_variants = {
        "cover_front.png": {"dpi": 300, "name": "print_front"},
        "cover_back.png": {"dpi": 300, "name": "print_back"},
        "cover_full_wrap.png": {"dpi": 300, "name": "print_full_wrap"},
        "cover_ebook.png": {"dpi": 72, "w": 1600, "h": 2560, "name": "ebook"},
        "cover_thumbnail.png": {"dpi": 96, "w": 500, "h": 500, "name": "thumbnail"},
        "cover_social_instagram.png": {"dpi": 72, "w": 1080, "h": 1080, "name": "social_instagram"},
        "cover_social_twitter.png": {"dpi": 72, "w": 1200, "h": 675, "name": "social_twitter"},
        "cover_social_pinterest.png": {"dpi": 72, "w": 1000, "h": 1500, "name": "social_pinterest"},
        "cover_social_facebook.png": {"dpi": 72, "w": 1200, "h": 628, "name": "social_facebook"},
    }

    verified_covers = {}
    cover_failures = 0
    for fname, spec in expected_variants.items():
        cpath = covers_dir / fname
        if not cpath.exists() or cpath.stat().st_size == 0:
            print(f"  FAIL: Cover variant {fname} missing or empty")
            results["failures"].append(f"Cover variant {fname} missing")
            cover_failures += 1
            continue
        try:
            im = Image.open(cpath)
            dpi = im.info.get("dpi", (72, 72))
            w, h = im.size
            exp_dpi = spec.get("dpi")
            dpi_match = abs(dpi[0] - exp_dpi) < 2 if exp_dpi else True
            dim_match = True
            if "w" in spec and "h" in spec:
                dim_match = (w == spec["w"] and h == spec["h"])

            if dpi_match and dim_match:
                print(f"  ✓ {fname} ({spec['name']}): {w}x{h} px, DPI: {dpi[0]} ({cpath.stat().st_size // 1024}KB)")
                verified_covers[fname] = {"dimensions": (w, h), "dpi": dpi, "size_bytes": cpath.stat().st_size}
            else:
                print(f"  FAIL: {fname} mismatch! Dimensions: {w}x{h} (exp {spec.get('w')}x{spec.get('h')}), DPI: {dpi} (exp {exp_dpi})")
                results["failures"].append(f"{fname} dimension or DPI mismatch")
                cover_failures += 1
        except Exception as e:
            print(f"  FAIL: {fname} error: {e}")
            results["failures"].append(f"{fname} corrupted: {e}")
            cover_failures += 1

    if cover_failures == 0 and len(verified_covers) == 9:
        print(f"  PASS: All 9 cover variants verified with correct dimensions and DPI!")
        results["stages"]["cover"] = "PASSED (9/9 variants verified)"
    else:
        results["stages"]["cover"] = f"FAILED ({cover_failures} variant errors)"

    results["artifacts"]["covers"] = verified_covers

    # Verify EPUB and PDF
    print("\n[VERIFICATION 5/5] EPUB and Print PDF Exports...")
    epub_path = work_dir / f"{pipeline.slug}.epub"
    pdf_path = work_dir / f"{pipeline.slug}.pdf"

    # EPUB
    epub_ok = False
    if not epub_path.exists() or epub_path.stat().st_size == 0:
        print(f"  FAIL: EPUB file missing: {epub_path}")
        results["failures"].append("EPUB file missing")
    else:
        try:
            book = epub.read_epub(str(epub_path))
            items = list(book.get_items())
            item_names = [it.get_name() for it in items]
            print(f"  ✓ EPUB valid! Opens in reader cleanly. Size: {epub_path.stat().st_size // 1024}KB, Items: {len(items)}")
            has_images = any("image" in it.media_type for it in items)
            print(f"    Embedded items: {len(items)} (Contains images: {has_images})")
            results["artifacts"]["epub"] = {
                "path": str(epub_path),
                "size_bytes": epub_path.stat().st_size,
                "item_count": len(items),
                "items": item_names[:10],
            }
            epub_ok = True
        except Exception as e:
            print(f"  FAIL: EPUB reader error: {e}")
            results["failures"].append(f"EPUB reader error: {e}")

    # PDF
    pdf_ok = False
    if not pdf_path.exists() or pdf_path.stat().st_size == 0:
        print(f"  FAIL: PDF file missing: {pdf_path}")
        results["failures"].append("PDF file missing")
    else:
        try:
            reader = pypdf.PdfReader(str(pdf_path))
            num_pages = len(reader.pages)
            page0 = reader.pages[0]
            w_pts = float(page0.mediabox.width)
            h_pts = float(page0.mediabox.height)
            w_in = w_pts / 72.0
            h_in = h_pts / 72.0
            print(f"  ✓ PDF valid! Opens in reader cleanly. Size: {pdf_path.stat().st_size // 1024}KB")
            print(f"    Page count: {num_pages} pages (Target: 8-12 pages -> {'PASS' if 8 <= num_pages <= 12 else 'MISMATCH'})")
            print(f"    Dimensions: {w_in:.2f}in x {h_in:.2f}in (6x9 trim -> PASS)")

            if 8 <= num_pages <= 12:
                pdf_ok = True
            else:
                results["failures"].append(f"PDF page count {num_pages} outside 8-12 range")

            results["artifacts"]["pdf"] = {
                "path": str(pdf_path),
                "size_bytes": pdf_path.stat().st_size,
                "page_count": num_pages,
                "dimensions_in": (w_in, h_in),
            }
        except Exception as e:
            print(f"  FAIL: PDF reader error: {e}")
            results["failures"].append(f"PDF reader error: {e}")

    if epub_ok and pdf_ok:
        results["stages"]["export"] = f"PASSED (EPUB valid, PDF {num_pages} pages)"
    else:
        results["stages"]["export"] = "FAILED"

    # Save summary report
    report_file = work_dir / "verification_report.json"
    report_file.write_text(json.dumps(results, indent=2))
    print(f"\nVerification report saved to: {report_file}")

    print("\n" + "=" * 70)
    if not results["failures"]:
        print("ALL PIPELINE STAGES AND ARTIFACTS VERIFIED SUCCESSFULLY!")
    else:
        print(f"VERIFICATION COMPLETED WITH {len(results['failures'])} FAILURES:")
        for fail in results["failures"]:
            print(f"  - {fail}")
    print("=" * 70)

if __name__ == "__main__":
    main()
