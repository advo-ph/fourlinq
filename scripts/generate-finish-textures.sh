#!/bin/bash
# Generate 7 wood-grain finish textures by recoloring real FourlinQ profile photos.
#
# Source images:
#   public/images/wp-export/Walnut-Profile.jpg     → darker grain base
#   public/images/wp-export/Golden-Oak-Profile.jpg → lighter grain base
#
# For each finish, the chosen base is desaturated to gray (preserves grain detail),
# then re-tinted between a per-finish DARK and LIGHT color via +level-colors. The
# pair is set so DARK lands near the swatch hex × 0.55 and LIGHT near the hex × 1.10,
# which keeps the brochure swatch as the dominant midtone.

set -e
cd "$(dirname "$0")/.."

WP=public/images/wp-export
OUT=public/images/textures/finish
mkdir -p "$OUT"

# Base wood-grain crops — 440×440 of the flat front face, scaled to 512×512.
magick "$WP/Walnut-Profile.jpg"     -crop 440x440+1100+650 -resize 512x512! /tmp/wood-dark-base.jpg
magick "$WP/Golden-Oak-Profile.jpg" -crop 440x440+1100+650 -resize 512x512! /tmp/wood-light-base.jpg

# tint <id> <base> <dark> <light>
tint() {
  local id="$1" base="$2" dark="$3" light="$4"
  magick "$base" -colorspace gray -level 18%,82% +level-colors "$dark","$light" \
    -quality 85 "$OUT/$id.jpg"
  echo "  → $OUT/$id.jpg ($dark → $light)"
}

echo "Generating finish textures…"
# id              base                    dark        light       (color pairs tuned against the real board photo)
tint oak-light    /tmp/wood-light-base.jpg "#7A6A4A"   "#EDE0BE"
tint oak-malt     /tmp/wood-light-base.jpg "#5D4A22"   "#D8B881"
tint woodgray     /tmp/wood-light-base.jpg "#1E2025"   "#5A5E63"   # darker cool slate-gray with grain
tint dark-oak     /tmp/wood-dark-base.jpg  "#3B1A0A"   "#A0552B"   # medium-dark with red undertone
tint walnut       /tmp/wood-dark-base.jpg  "#3D2412"   "#9B6440"   # slightly warmer / lighter
tint golden-oak   /tmp/wood-light-base.jpg "#6A4205"   "#F2A21A"   # punchier orange-amber
tint 2-wood-black /tmp/wood-dark-base.jpg  "#12161A"   "#3A4148"   # slate-y with bluish grain showing

echo "Done. 7 textures in $OUT"
ls -la "$OUT"
