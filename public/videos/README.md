# Hero video assets

The home page `VideoHero` component loads `/videos/hero-loop.mp4` from this folder.

When the file is missing, the component automatically falls back to the
photo carousel (no broken playback, no error visible to users — graceful
degradation by design).

## Current asset

`hero-loop.mp4` is a 1920×1080 H.264 web-delivery copy compressed from a
2560×1440 master (`MainVid_FourlinQ.mp4`) supplied by the client. CRF 21,
H.264 high profile, faststart enabled, no audio. Visually identical to
the master at hero display size.

To replace the video (e.g. when a new master is supplied), use:

```
ffmpeg -i <master>.mp4 \
  -vf scale=1920:1080:flags=lanczos \
  -c:v libx264 -preset slow -crf 21 -profile:v high \
  -pix_fmt yuv420p -an -movflags +faststart \
  public/videos/hero-loop.mp4
```

Keep target file size under 25 MB for PH mobile bandwidth respect.

For the full hero-video pipeline and AI-animation fallback, see
[docs/HERO_VIDEO_RUNBOOK.md](../../docs/HERO_VIDEO_RUNBOOK.md).
