import json
from pathlib import Path
from collections import Counter
import re

BASE = Path(__file__).parent
INPUT = BASE / "cuts_tts.json"
OUT = BASE / "metadata"
OUT.mkdir(exist_ok=True)

with open(INPUT, encoding="utf-8") as f:
    data = json.load(f)

cuts = data.get("processed") or data.get("cuts") or data

# --- 키워드 추출 ---
text_all = " ".join(c["tts_text"] for c in cuts)
words = re.findall(r"[가-힣]{2,}", text_all)
common = [w for w, _ in Counter(words).most_common(20)]

topic = common[0] if common else "역사의 한 순간"

# --- Title ---
titles = [
    f"{topic}, 우리가 지금 서 있는 지점",
    f"{topic}은 왜 지금 다시 읽혀야 하는가",
    f"{topic} 이후, 세계는 이렇게 바뀌었다"
]

# --- Description ---
description = f"""이 영상은 {topic}을 통해
우리가 지금 어디쯤 와 있는지를 살펴봅니다.

✔ 주요 내용
- 사건의 배경
- 당시 사람들의 선택
- 그 선택이 남긴 구조

지금 우리는 또 하나의 전환점에 서 있습니다.
"""

# --- Tags ---
tags = list(dict.fromkeys(common[:15]))

# --- Fixed Comment ---
comment = """이 영상은 자극적인 결론을 제시하지 않습니다.
대신, “지금 우리는 어디쯤 와 있는가”라는 질문을 남깁니다.

여러분의 생각을 남겨주세요.
"""

# --- Thumbnail Text ---
thumbnail = common[0] if len(common[0]) <= 12 else common[0][:10]

# --- Upload Time ---
schedule = "추천 업로드: 화·목·일 / 21:00~22:30"

metadata = {
    "titles": titles,
    "description": description.strip(),
    "tags": tags,
    "fixed_comment": comment.strip(),
    "thumbnail_text": thumbnail,
    "schedule": schedule
}

(OUT / "youtube_metadata.json").write_text(
    json.dumps(metadata, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("✅ 업로드 메타데이터 생성 완료")
# Metadata generator
