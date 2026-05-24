#!/usr/bin/env python3
"""
Fix 1: Regenerate specialist finishes with deeper lighting (match windows/doors depth).
Fix 2: Regenerate white finish for all windows/doors with reduced metallic shine.
"""

import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
WP_EXPORT = PROJECT_ROOT / "public" / "images" / "wp-export"
TEXTURES = PROJECT_ROOT / "public" / "images" / "finishes" / "textures"
OUTPUT = PROJECT_ROOT / "public" / "images" / "product-finishes"
OAKLIGHT_BASES_V2 = Path("/Users/princewagan/Downloads/oaklight-bases-v2")
OAKLIGHT_SPECIALIST = PROJECT_ROOT / "scripts" / "oaklight-bases"

SPECIALIST_PRODUCTS = {
    "arch-shapes": {"file": "archshapes.png", "oaklight": OAKLIGHT_SPECIALIST / "arch-shapes-oaklight.png"},
    "curtain-wall": {"file": "curtainwall.png", "oaklight": OAKLIGHT_SPECIALIST / "curtain-wall-oaklight.png"},
    "custom-shapes": {"file": "customshapes.png", "oaklight": OAKLIGHT_SPECIALIST / "custom-shapes-oaklight.png"},
}

WINDOW_DOOR_PRODUCTS = {
    "casement": {"file": "casement.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "casement-oaklight.png"},
    "sliding-window": {"file": "slidingwindow.png", "oaklight": OAKLIGHT_BASES_V2 / "sliding-window-oaklight.png"},
    "awning": {"file": "awning.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "awning-oaklight.png"},
    "special-shapes": {"file": "specialshapes.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "special-shapes-oaklight.png"},
    "sliding-door": {"file": "slidingdoor.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "sliding-door-oaklight.png"},
    "slide-and-fold": {"file": "slideandfold.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "slide-and-fold-oaklight.png"},
    "casement-door": {"file": "casement-door.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "casement-door-oaklight.png"},
    "french-door": {"file": "frenchdoor.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "french-door-oaklight.png"},
    "large-panel": {"file": "largepanel.png", "oaklight": OAKLIGHT_BASES_V2 / "large-panel-oaklight.png"},
    "lift-and-slide": {"file": "liftandslide.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "lift-and-slide-oaklight.png"},
    "90-series": {"file": "90series.jpeg", "oaklight": OAKLIGHT_BASES_V2 / "90-series-oaklight.png"},
}

WOOD_FINISHES = {
    "oaklight": "oak-light.png",
    "oakmalt": "oak-malt.jpeg",
    "darkoak": "dark-oak.jpeg",
    "walnut": "walnut.jpeg",
    "goldenoak": "golden-oak.jpg",
    "blackwood": "black-wood.jpeg",
    "graywood": "gray-wood.jpeg",
}

SOLID_FINISHES = {
    "white": (255, 255, 255),
    "silica-cream": (232, 220, 200),
    "jet-black": (28, 28, 30),
    "charcoal-gray": (74, 74, 76),
    "matte-quartz": (184, 176, 164),
}


def create_frame_mask(original: Image.Image, oaklight: Image.Image) -> Image.Image:
    orig_gray = original.convert("L")
    oak_gray = oaklight.resize(original.size, Image.LANCZOS).convert("L")

    orig_arr = np.array(orig_gray).astype(np.float32)
    oak_arr = np.array(oak_gray).astype(np.float32)

    diff = oak_arr - orig_arr
    bright_background = orig_arr > 210

    frame_mask = (diff > 20) & ~bright_background
    not_dark_but_frame = (orig_arr < 170) & (oak_arr > 100) & ~bright_background
    frame_mask = frame_mask | not_dark_but_frame

    mask_img = Image.fromarray((frame_mask * 255).astype(np.uint8))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3))
    mask_img = mask_img.filter(ImageFilter.MinFilter(3))
    mask_img = mask_img.filter(ImageFilter.MedianFilter(5))
    return mask_img


def compute_lighting(original: Image.Image, mask: Image.Image, floor: float) -> np.ndarray:
    orig_arr = np.array(original.convert("L")).astype(np.float32)
    mask_arr = np.array(mask)
    frame_px = mask_arr > 128

    if not np.any(frame_px):
        return np.ones_like(orig_arr)

    vals = orig_arr[frame_px]
    lo, hi = np.percentile(vals, [1, 99])

    if hi <= lo:
        return np.ones_like(orig_arr)

    normed = (orig_arr - lo) / (hi - lo)
    span = 1.0 - floor
    lighting = floor + np.clip(normed, 0, 1) * span
    return np.clip(lighting, floor, 1.0)


def apply_wood_texture(original, mask, texture_path, lighting):
    texture = Image.open(texture_path).convert("RGB")
    result = original.copy().convert("RGB")
    w, h = result.size
    tw, th = texture.size

    tiled = Image.new("RGB", (w, h))
    for y in range(0, h, th):
        for x in range(0, w, tw):
            tiled.paste(texture, (x, y))

    tiled_arr = np.array(tiled).astype(np.float32)
    for c in range(3):
        tiled_arr[:, :, c] *= lighting
    tiled_lit = Image.fromarray(np.clip(tiled_arr, 0, 255).astype(np.uint8))

    mask_blur = mask.filter(ImageFilter.GaussianBlur(1.5))
    result.paste(tiled_lit, mask=mask_blur)
    return result


def apply_solid_color(original, mask, color, lighting):
    result = original.copy().convert("RGB")
    w, h = result.size

    solid_arr = np.full((h, w, 3), color, dtype=np.float32)
    for c in range(3):
        solid_arr[:, :, c] *= lighting
    solid_img = Image.fromarray(np.clip(solid_arr, 0, 255).astype(np.uint8))

    mask_blur = mask.filter(ImageFilter.GaussianBlur(1.5))
    result.paste(solid_img, mask=mask_blur)
    return result


def regen_specialist():
    """Regenerate all specialist finishes with deeper lighting (floor=0.45)."""
    print("=" * 50)
    print("FIX 1: Specialist — deeper lighting")
    print("=" * 50)

    for pid, info in SPECIALIST_PRODUCTS.items():
        original = Image.open(WP_EXPORT / info["file"]).convert("RGB")
        oaklight = Image.open(info["oaklight"]).convert("RGB").resize(original.size, Image.LANCZOS)

        mask = create_frame_mask(original, oaklight)
        lighting = compute_lighting(original, mask, floor=0.45)

        for fid, tfile in WOOD_FINISHES.items():
            out = OUTPUT / f"{pid}-{fid}.jpeg"
            result = apply_wood_texture(original, mask, TEXTURES / tfile, lighting)
            result.save(out, "JPEG", quality=92)
            print(f"  OK {out.name}")

        for fid, color in SOLID_FINISHES.items():
            out = OUTPUT / f"{pid}-{fid}.jpeg"
            result = apply_solid_color(original, mask, color, lighting)
            result.save(out, "JPEG", quality=92)
            print(f"  OK {out.name}")


def regen_whites():
    """Regenerate white finish for windows/doors with softer shading (floor=0.82)."""
    print("\n" + "=" * 50)
    print("FIX 2: Windows/Doors white — reduce metallic shine")
    print("=" * 50)

    for pid, info in WINDOW_DOOR_PRODUCTS.items():
        orig_path = WP_EXPORT / info["file"]
        oak_path = info["oaklight"]

        if not oak_path.exists():
            print(f"  SKIP {pid} — no oaklight base")
            continue

        original = Image.open(orig_path).convert("RGB")
        oaklight = Image.open(oak_path).convert("RGB").resize(original.size, Image.LANCZOS)

        mask = create_frame_mask(original, oaklight)
        lighting = compute_lighting(original, mask, floor=0.82)

        out = OUTPUT / f"{pid}-white.jpeg"
        result = apply_solid_color(original, mask, (255, 255, 255), lighting)
        result.save(out, "JPEG", quality=92)
        print(f"  OK {out.name}")


if __name__ == "__main__":
    regen_specialist()
    regen_whites()
    print("\nDone.")
