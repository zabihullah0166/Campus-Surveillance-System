"""
PDF challan generation utilities.

The app stores challans in SQLite from main.py, so this module accepts plain
dict-like rows instead of ORM models.
"""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


TEMPLATE_PATH = Path("data/chalan_template.png")
OUTPUT_DIR = Path("data/challans")
EVIDENCE_DIR = "data/Evidence"


def generate_challan_number():
    today = datetime.now().strftime("%Y%m%d")

    # Count existing challans for today
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    existing = [f for f in os.listdir(OUTPUT_DIR) if f.startswith(today)]
    count = len(existing) + 1

    return f"{today}{str(count).zfill(2)}"


def _font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def _as_date(value: str | None) -> str:
    if not value:
        return ""
    try:
        return datetime.fromisoformat(str(value)).strftime("%d %b %Y")
    except ValueError:
        return str(value)


def _text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: object, size: int = 28, bold: bool = False) -> None:
    draw.text(xy, str(value or ""), fill=(0, 0, 0), font=_font(size, bold=bold))


def _wrapped_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: object,
    width: int = 26,
    size: int = 25,
    line_gap: int = 7,
) -> None:
    font = _font(size)
    y = xy[1]
    for line in wrap(str(value or ""), width=width)[:4]:
        draw.text((xy[0], y), line, fill=(0, 0, 0), font=font)
        y += size + line_gap


def generate_challan_pdf(challan: dict, detection: dict | None = None, output_dir: Path = OUTPUT_DIR) -> str:
    """
    Render one filled e-challan PDF from the PNG template and return its path.
    """
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Challan template not found: {TEMPLATE_PATH}")

    output_dir.mkdir(parents=True, exist_ok=True)
    challan_no = generate_challan_number()
    pdf_path = output_dir / f"{challan_no}.pdf"

    base = Image.open(TEMPLATE_PATH).convert("RGB")
    draw = ImageDraw.Draw(base)
    detection = detection or {}

    # Paste snapshot
    try:
        if detection.get("image_path"):
            filename = os.path.basename(detection["image_path"])
            abs_image_path = os.path.join(EVIDENCE_DIR, filename)
            if os.path.exists(abs_image_path):
                evidence_img = Image.open(abs_image_path).convert("RGB")
                evidence_img.thumbnail((800, 400))
                base.paste(evidence_img, (320, 400))
    except Exception as e:
        print("Image Error:", e)

    issued_at = challan.get("issued_at") or datetime.now().isoformat(timespec="seconds")
    due_date = challan.get("due_date")
    fine_amount = challan.get("fine_amount") or challan.get("fine") or 0
    location = detection.get("location") or detection.get("camera_name") or "Campus Zone"

    # Challan number and date
    current_date = datetime.now().strftime("%d-%m-%Y")
    _text(draw, (1450, 233), challan_no, 22)
    _text(draw, (1450, 260), current_date, 18)
    _text(draw, (1450, 280), location, 18)

    # Student info
    _text(draw, (1100, 390), challan.get("student_name"), 25, bold=True)
    _text(draw, (1100, 425), challan.get("father_name"), 25)
    _text(draw, (1100, 475), challan.get("student_roll_no"), 25)
    _text(draw, (1100, 530), challan.get("contact"), 25)

    # Violation details
    _text(draw, (1100, 610), challan.get("violation_type"), 25)
    _text(draw, (1100, 670), "Campus Rule Section 1", 24)
    _text(draw, (1100, 703), f"{fine_amount}", 25, bold=True)
    _text(draw, (1100, 740), f"{fine_amount}", 24, bold=True)

    instructions = [
        "Pay before due date.",
        "Keep this PDF as proof.",
        "Use challan number as \nreference.",
    ]
    y = 396
    for instruction in instructions:
        _text(draw, (1350, y), instruction, 22)
        y += 34

    base.save(pdf_path, "PDF", resolution=100.0)
    return str(pdf_path)


if __name__ == "__main__":
    # Sample data for testing
    sample_challan = {
        "student_name": "John Doe",
        "father_name": "Jane Doe",
        "student_roll_no": "12345",
        "contact": "123-456-7890",
        "violation_type": "Cigarette violation",
        "fine_amount": 500,
        "issued_at": datetime.now().isoformat(),
        "due_date": (datetime.now().replace(day=datetime.now().day + 7)).isoformat()
    }
    
    sample_detection = {
        "image_path": r"G:\Fyp copy2\data\Evidence\Unknown_Subject_human_cigarette_human_20260509_215445.jpg",
        "location": "Main Gate"
    }
    
    try:
        pdf_path = generate_challan_pdf(sample_challan, sample_detection)
        print(f"Challan generated successfully: {pdf_path}")
    except Exception as e:
        print(f"Error generating challan: {e}")
