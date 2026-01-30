from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE = Path(__file__).parent
IN_IMG = BASE / "thumbnails/thumbnail.png"
OUT_IMG = BASE / "thumbnails/thumbnail_shorts.png"

CANVAS_W, CANVAS_H = 1080, 1920

# --- 로드 ---
src = Image.open(IN_IMG).convert("RGB")
sw, sh = src.size

# --- 중앙 크롭 (세로 비율 맞추기) ---
target_ratio = CANVAS_W / CANVAS_H
src_ratio = sw / sh

if src_ratio > target_ratio:
    # 가로가 더 넓음 → 좌우 크롭
    new_w = int(sh * target_ratio)
    left = (sw - new_w) // 2
    crop = src.crop((left, 0, left + new_w, sh))
else:
    # 세로가 더 김 → 상하 크롭
    new_h = int(sw / target_ratio)
    top = (sh - new_h) // 2
    crop = src.crop((0, top, sw, top + new_h))

# --- 리사이즈 ---
crop = crop.resize((CANVAS_W, CANVAS_H), Image.LANCZOS)

# --- 텍스트 재배치 ---
draw = ImageDraw.Draw(crop)

try:
    font = ImageFont.truetype("C:/Windows/Fonts/batang.ttc", 72)
except:
    font = ImageFont.load_default()

# 썸네일 문구를 가로 썸네일에서 재사용한다고 가정
TEXT = ""  # 이미 가로 썸네일에 들어가 있으므로 비워둠

# 필요 시 수동 텍스트 추가 가능
# draw.text((80, CANVAS_H - 420), TEXT, font=font, fill=(245,245,245))

# --- 저장 ---
crop.save(OUT_IMG)

print(f"📱 Shorts 썸네일 생성 완료 → {OUT_IMG}")
