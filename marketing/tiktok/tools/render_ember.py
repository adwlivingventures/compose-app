#!/usr/bin/env python3
"""
Ember renderer — zero-credit COMPOSE TikTok clips (1080x1920, 24fps).

Modes:
  text   — timed Newsreader-italic lines fading over an animated Ember Dusk
           gradient with film grain. Spec: {"mode":"text","duration":30,
           "lines":[{"text":"...","start":0,"end":6}, ...], "arc": false}
           "arc": true interpolates the dusk->dawn ground color across the clip
           (P5 "75 Days From Now").
  breath — paced breathing circle (default 4s in / 6s out) with count cues.
           Spec: {"mode":"breath","duration":45,"inhale":4,"exhale":6,
           "intro":"...","outro":"Paced by Compose.","intro_end":4,"outro_start":40}

Usage: python3 render_ember.py spec.json out.mp4
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 24
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(os.path.dirname(HERE), "assets", "fonts")

GROUND = (8, 10, 15)        # #080A0F
GROUND_DAWN = (18, 22, 32)  # day-75 ceiling (~8% luminance, first light)
SAND = (200, 155, 109)      # #C89B6D
TEXT_MAIN = (222, 226, 234)
FOOTER = (110, 120, 140)

def font(path, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, path), size)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def base_bg(ground):
    """Vertical gradient ground with a warm emissive bloom low in frame."""
    g = np.zeros((H, W, 3), dtype=np.float32)
    top = np.array(ground, dtype=np.float32) * 0.85
    bot = np.array(ground, dtype=np.float32) * 1.35
    for y in range(H):
        g[y, :] = top + (bot - top) * (y / H)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy, rad = W * 0.5, H * 0.86, H * 0.75
    d = np.sqrt((xx - cx) ** 2 + ((yy - cy) * 1.15) ** 2) / rad
    glow = np.clip(1.0 - d, 0, 1) ** 2.6
    for i, c in enumerate(SAND):
        g[:, :, i] += glow * c * 0.16
    return g

def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if draw.textlength(t, font=fnt) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w_
    lines.append(cur)
    return lines

def text_layer(text, fnt, fill, y_center, tracking=0):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lines = wrap(d, text, fnt, W - 220)
    lh = int(fnt.size * 1.42)
    y = y_center - (len(lines) * lh) // 2
    for ln in lines:
        if tracking:
            ln = (" " * 1).join(list(ln))
        tw = d.textlength(ln, font=fnt)
        d.text(((W - tw) // 2, y), ln, font=fnt, fill=fill + (255,))
        y += lh
    return img

def envelope(t, start, end, fade=0.8):
    if t < start or t > end:
        return 0.0
    a = min(1.0, (t - start) / fade)
    b = min(1.0, (end - t) / fade)
    return max(0.0, min(a, b))

def render(spec, out):
    dur = spec["duration"]
    n = int(dur * FPS)
    mode = spec.get("mode", "text")
    serif = font("NewsreaderMedItalic.ttf", 68)
    serif_sm = font("NewsreaderItalic.ttf", 54)
    sans = font("Inter.ttf", 30)
    sans_big = font("InterMed.ttf", 40)

    layers = []
    if mode == "text":
        for ln in spec["lines"]:
            big = ln.get("size", "lg") == "lg"
            layers.append((ln["start"], ln["end"],
                           text_layer(ln["text"], serif if big else serif_sm,
                                      TEXT_MAIN, int(H * 0.44))))
    footer = text_layer("C O M P O S E", sans, FOOTER, int(H * 0.925))

    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    arc = spec.get("arc", False)
    bg0 = base_bg(GROUND)
    bg1 = base_bg(GROUND_DAWN) if arc else None
    rng = np.random.default_rng(7)

    for i in range(n):
        t = i / FPS
        if arc:
            k = t / dur
            bg = bg0 * (1 - k) + bg1 * k
        else:
            bg = bg0
        breathe = 0.88 + 0.12 * math.sin(2 * math.pi * t / 22.0)
        frame = np.clip(bg * breathe, 0, 255)
        grain = rng.normal(0, 2.6, (H, W, 1)).astype(np.float32)
        frame = np.clip(frame + grain, 0, 255).astype(np.uint8)
        im = Image.fromarray(frame, "RGB").convert("RGBA")

        if mode == "text":
            for (s, e, layer) in layers:
                a = envelope(t, s, e)
                if a > 0:
                    l2 = layer.copy()
                    l2.putalpha(l2.split()[3].point(lambda p: int(p * a)))
                    im.alpha_composite(l2)
        else:  # breath
            inhale = spec.get("inhale", 4.0); exhale = spec.get("exhale", 6.0)
            cyc = inhale + exhale
            bt = (t - spec.get("intro_end", 4.0)) % cyc
            active = spec.get("intro_end", 4.0) <= t < spec.get("outro_start", dur - 5)
            if active:
                if bt < inhale:
                    k = bt / inhale; phase, cnt = "in", int(bt) + 1
                else:
                    k = 1 - (bt - inhale) / exhale; phase, cnt = "out", int(bt - inhale) + 1
                ease = 0.5 - 0.5 * math.cos(math.pi * k)
                r = int(130 + ease * 190)
                rq = (r // 4) * 4
                if not hasattr(render, "_sprites"):
                    render._sprites, render._cues = {}, {}
                if rq not in render._sprites:
                    s = int(rq * 1.5 + 70) * 2
                    sp = Image.new("RGBA", (s, s), (0, 0, 0, 0))
                    sd = ImageDraw.Draw(sp)
                    c = s // 2
                    sd.ellipse([c - rq * 1.5, c - rq * 1.5, c + rq * 1.5, c + rq * 1.5],
                               fill=SAND + (40,))
                    sp = sp.filter(ImageFilter.GaussianBlur(46))
                    sd = ImageDraw.Draw(sp)
                    sd.ellipse([c - rq, c - rq, c + rq, c + rq], fill=SAND + (215,))
                    render._sprites[rq] = sp.filter(ImageFilter.GaussianBlur(6))
                sp = render._sprites[rq]
                cx, cy = W // 2, int(H * 0.46)
                im.alpha_composite(sp, (cx - sp.width // 2, cy - sp.height // 2))
                cue = ("in" if phase == "in" else "out") + "".join(
                    f"  ·  {j}" for j in range(2, cnt + 1))
                if cue not in render._cues:
                    render._cues[cue] = text_layer(cue, sans_big, TEXT_MAIN, int(H * 0.70))
                im.alpha_composite(render._cues[cue])
            if t < spec.get("intro_end", 4.0) and spec.get("intro"):
                a = envelope(t, 0, spec.get("intro_end", 4.0))
                l2 = text_layer(spec["intro"], serif_sm, TEXT_MAIN, int(H * 0.44))
                l2.putalpha(l2.split()[3].point(lambda p: int(p * a)))
                im.alpha_composite(l2)
            if t >= spec.get("outro_start", dur - 5) and spec.get("outro"):
                a = envelope(t, spec.get("outro_start", dur - 5), dur)
                l2 = text_layer(spec["outro"], serif, TEXT_MAIN, int(H * 0.44))
                l2.putalpha(l2.split()[3].point(lambda p: int(p * a)))
                im.alpha_composite(l2)

        im.alpha_composite(footer)
        ff.stdin.write(im.convert("RGB").tobytes())

    ff.stdin.close(); ff.wait()
    print("wrote", out)

if __name__ == "__main__":
    with open(sys.argv[1]) as f:
        spec = json.load(f)
    render(spec, sys.argv[2])
