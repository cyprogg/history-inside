import json
from pathlib import Path

BASE = Path(__file__).parent
CUTS_FILE = BASE / "cuts_tts.json"

with open(CUTS_FILE, encoding="utf-8") as f:
    data = json.load(f)

cuts = data.get("processed") or data.get("cuts") or data

hook = next(c for c in cuts if c["type"] == "hook")
ending = next(c for c in cuts if c["type"] == "ending")

def score_hook(cut):
    score = 0
    text = cut["tts_text"]

    if len(text) <= 300:
        score += 1

    for kw in ["문제는", "지금", "우리는"]:
        if kw in text:
            score += 1

    for kw in ["전환", "구조", "질서", "세계", "시대"]:
        if kw in text:
            score += 1

    return score

def score_ending(cut):
    score = 0
    text = cut["tts_text"]

    for kw in ["지금 우리는", "다시", "이후", "앞으로"]:
        if kw in text:
            score += 1

    for kw in ["어쩌면", "천천히", "멀리서"]:
        if kw in text:
            score += 1

    if len(text) >= 250:
        score += 1

    return score

hook_score = score_hook(hook)
ending_score = score_ending(ending)

if hook_score >= 2 and hook_score > ending_score:
    selected = "hook"
else:
    selected = "ending"

result = {
    "selected": selected,
    "hook_score": hook_score,
    "ending_score": ending_score
}

out = BASE / "thumbnail_bg.json"
out.write_text(
    json.dumps(result, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print(f"🖼️ 썸네일 배경 선택 → {selected.upper()}")
