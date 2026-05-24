#!/usr/bin/env python3
"""
Generate finish variants for specialist products.
Step 1: AI (Gemini) generates ONLY oaklight base for each product.
Step 2: Python masking script uses original vs oaklight comparison to create
        frame mask, then applies all other textures/solid colors via masking.
"""

import os
import sys
import time
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter

from google import genai
from google.genai import types

PROJECT_ROOT = Path(__file__).resolve().parent.parent
WP_EXPORT = PROJECT_ROOT / "public" / "images" / "wp-export"
TEXTURES = PROJECT_ROOT / "public" / "images" / "finishes" / "textures"
OUTPUT = PROJECT_ROOT / "public" / "images" / "product-finishes"

SPECIALIST_PRODUCTS = {
    "arch-shapes": {
        "file": "archshapes.png",
        "desc": "arched window with a semi-circular top divided into fan-shaped panes above three tall vertical panes, uPVC frame",
    },
    "curtain-wall": {
        "file": "curtainwall.png",
        "desc": "curtain wall system with six glass panels arranged in a 2x3 grid, thick uPVC mullions and transoms",
    },
    "custom-shapes": {
        "file": "customshapes.png",
        "desc": "circular porthole-style fixed window with a thick round uPVC frame",
    },
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


# ─── Step 1: AI-generate oaklight base ───────────────────────────────────────

def mime_for(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower()
    return {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "image/png")


def generate_oaklight_base(client, product_id: str, product_info: dict, oaklight_dir: Path):
    out_path = oaklight_dir / f"{product_id}-oaklight.png"
    if out_path.exists():
        print(f"  SKIP {out_path.name} (exists)")
        return out_path

    base_path = WP_EXPORT / product_info["file"]
    texture_path = TEXTURES / "oak-light.png"

    with open(base_path, "rb") as f:
        base_bytes = f.read()
    with open(texture_path, "rb") as f:
        texture_bytes = f.read()

    prompt = (
        f"Replace the frame material on this {product_info['desc']}. "
        f"Change the dark/black uPVC frame to oak light wood finish — pale golden blonde with soft fine grain. "
        f"Use the second image as the exact texture reference for the wood grain pattern and color. "
        f"PRESERVE: transparent/reflective glass panes, white/light background, exact window shape and proportions, "
        f"any black metal hardware (handles, hinges, locks). "
        f"The wood grain should follow the frame direction — vertical on vertical members, horizontal on horizontal members, "
        f"radiating on curved sections. "
        f"Photorealistic product photography, studio lighting, clean white background. "
        f"Output the image at the EXACT same dimensions and aspect ratio as the input image."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[
            types.Part.from_bytes(data=base_bytes, mime_type=mime_for(product_info["file"])),
            types.Part.from_bytes(data=texture_bytes, mime_type="image/png"),
            prompt,
        ],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            with open(out_path, "wb") as f:
                f.write(part.inline_data.data)
            print(f"  OK {out_path.name} ({len(part.inline_data.data) / 1024:.0f} KB)")
            return out_path

    print(f"  FAIL {out_path.name} — no image in response")
    return None


# ─── Step 2: Masking pipeline ────────────────────────────────────────────────

def create_frame_mask(original: Image.Image, oaklight: Image.Image) -> Image.Image:
    """
    Compare original (dark frame) vs AI oaklight (light frame) to find frame pixels.
    Frame pixels are dark in original but became light in the oaklight version.
    """
    orig_resized = original.convert("L")
    oak_resized = oaklight.resize(original.size, Image.LANCZOS).convert("L")

    orig_arr = np.array(orig_resized)
    oak_arr = np.array(oak_resized)

    dark_in_original = orig_arr < 100
    light_in_oaklight = oak_arr > 70
    bright_background = orig_arr > 200

    frame_mask = dark_in_original & light_in_oaklight & ~bright_background

    mask_img = Image.fromarray((frame_mask * 255).astype(np.uint8))
    mask_img = mask_img.filter(ImageFilter.MedianFilter(3))

    return mask_img


def apply_wood_texture(original: Image.Image, mask: Image.Image, texture_path: Path) -> Image.Image:
    """Tile wood texture across frame area defined by mask."""
    texture = Image.open(texture_path).convert("RGB")
    result = original.copy().convert("RGB")
    w, h = result.size
    tw, th = texture.size

    tiled = Image.new("RGB", (w, h))
    for y in range(0, h, th):
        for x in range(0, w, tw):
            tiled.paste(texture, (x, y))

    orig_gray = original.convert("L")
    orig_arr = np.array(orig_gray).astype(np.float32)
    p2, p98 = np.percentile(orig_arr[np.array(mask) > 128], [2, 98]) if np.any(np.array(mask) > 128) else (0, 255)

    if p98 > p2:
        shading = (orig_arr - p2) / (p98 - p2)
        shading = np.clip(shading, 0.3, 1.0)
    else:
        shading = np.ones_like(orig_arr)

    tiled_arr = np.array(tiled).astype(np.float32)
    for c in range(3):
        tiled_arr[:, :, c] *= shading

    tiled_shaded = Image.fromarray(np.clip(tiled_arr, 0, 255).astype(np.uint8))

    mask_blur = mask.filter(ImageFilter.GaussianBlur(1.5))
    result.paste(tiled_shaded, mask=mask_blur)
    return result


def apply_solid_color(original: Image.Image, mask: Image.Image, color: tuple) -> Image.Image:
    """Fill frame area with solid color, preserving shading for depth."""
    result = original.copy().convert("RGB")
    w, h = result.size

    orig_gray = original.convert("L")
    orig_arr = np.array(orig_gray).astype(np.float32)
    mask_arr = np.array(mask)

    frame_pixels = mask_arr > 128
    if np.any(frame_pixels):
        p2, p98 = np.percentile(orig_arr[frame_pixels], [2, 98])
    else:
        p2, p98 = 0, 255

    if p98 > p2:
        shading = (orig_arr - p2) / (p98 - p2)
        shading = np.clip(shading, 0.4, 1.0)
    else:
        shading = np.ones_like(orig_arr)

    solid = np.full((h, w, 3), color, dtype=np.float32)
    for c in range(3):
        solid[:, :, c] *= shading

    solid_img = Image.fromarray(np.clip(solid, 0, 255).astype(np.uint8))

    mask_blur = mask.filter(ImageFilter.GaussianBlur(1.5))
    result.paste(solid_img, mask=mask_blur)
    return result


def generate_all_finishes(product_id: str, original_path: Path, oaklight_path: Path):
    """Generate all finish variants for one product using masking."""
    original = Image.open(original_path).convert("RGB")
    oaklight = Image.open(oaklight_path).convert("RGB")

    print(f"  Creating frame mask...")
    mask = create_frame_mask(original, oaklight)

    for finish_id, texture_file in WOOD_FINISHES.items():
        out_path = OUTPUT / f"{product_id}-{finish_id}.jpeg"
        if out_path.exists():
            print(f"  SKIP {out_path.name} (exists)")
            continue

        texture_path = TEXTURES / texture_file
        result = apply_wood_texture(original, mask, texture_path)
        result.save(out_path, "JPEG", quality=92)
        print(f"  OK {out_path.name} ({out_path.stat().st_size / 1024:.0f} KB)")

    for finish_id, color in SOLID_FINISHES.items():
        out_path = OUTPUT / f"{product_id}-{finish_id}.jpeg"
        if out_path.exists():
            print(f"  SKIP {out_path.name} (exists)")
            continue

        result = apply_solid_color(original, mask, color)
        result.save(out_path, "JPEG", quality=92)
        print(f"  OK {out_path.name} ({out_path.stat().st_size / 1024:.0f} KB)")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    oaklight_dir = PROJECT_ROOT / "scripts" / "oaklight-bases"
    oaklight_dir.mkdir(parents=True, exist_ok=True)

    for product_id, product_info in SPECIALIST_PRODUCTS.items():
        print(f"\n{'='*50}")
        print(f"STEP 1: AI oaklight base — {product_id}")
        print(f"{'='*50}")

        oaklight_path = generate_oaklight_base(client, product_id, product_info, oaklight_dir)
        if oaklight_path is None:
            print(f"  Skipping {product_id} — oaklight generation failed")
            continue
        time.sleep(1)

        print(f"\n  STEP 2: Python masking — {product_id}")
        print(f"  {'-'*40}")

        original_path = WP_EXPORT / product_info["file"]
        generate_all_finishes(product_id, original_path, oaklight_path)

    print(f"\nDone. Finish variants in {OUTPUT}")


if __name__ == "__main__":
    main()
