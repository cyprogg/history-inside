from PIL import Image, ImageDraw, ImageFont
import json
from pathlib import Path

BASE = Path(__file__).parent
IMG_DIR = BASE / "images"
META = BASE / "metadata/youtube_metadata.json"
OUT = BASE / "thumbnails"
OUT.mkdir(exist_ok=True)

# --- 설정 ---
CANVAS_SIZE = (1280, 720)
TEXT_COLOR = (245, 245, 245)
SHADOW_COLOR = (0, 0, 0)
FONT_SIZE = 96

# 폰트 (없으면 기본으로 대체)
try:
    FONT = ImageFont.truetype("C:/Windows/Fonts/batang.ttc", FONT_SIZE)
except:
    FONT = ImageFont.load_default()

# --- 메타데이터 로드 ---
with open(META, encoding="utf-8") as f:
    meta = json.load(f)

text = meta["thumbnail_text"]

# --- 배경 이미지 선택 (CUT01 기준) ---
with open(BASE / "thumbnail_bg.json", encoding="utf-8") as f:
    sel = json.load(f)["selected"]

bg_path = IMG_DIR / ("CUT01.png" if sel == "hook" else "CUT%02d.png" % len(list(IMG_DIR.glob("CUT*.png"))))
bg = Image.open(bg_path).convert("RGB")
bg = bg.resize(CANVAS_SIZE)

# --- 그리기 ---
draw = ImageDraw.Draw(bg)

# 텍스트 위치 (좌측 하단)
x = 80
y = CANVAS_SIZE[1] - 200

# 그림자
draw.text((x + 3, y + 3), text, font=FONT, fill=SHADOW_COLOR)
draw.text((x, y), text, font=FONT, fill=TEXT_COLOR)

# 저장
out_path = OUT / "thumbnail.png"
bg.save(out_path)

print(f"🖼️ 썸네일 생성 완료 → {out_path}")
# Thumbnail generator
