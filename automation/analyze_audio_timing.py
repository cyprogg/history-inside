import json
import wave
from pathlib import Path

BASE = Path(__file__).parent
AUDIO = BASE / "audio"
OUT = BASE / "timing"
OUT.mkdir(exist_ok=True)

with open(BASE / "cuts_tts.json", encoding="utf-8") as f:
    data = json.load(f)

cuts = data.get("processed") or data.get("cuts") or data

def duration(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()

timeline = []
current = 0.0

for cut in cuts:
    cid = f"CUT{int(cut['id']):02d}"
    wav = AUDIO / f"{cid}.wav"
    dur = duration(wav)

    timeline.append({
        "id": cid,
        "start": round(current, 2),
        "end": round(current + dur, 2),
        "duration": round(dur, 2)
    })

    current += dur

(OUT / "cuts_timing.json").write_text(
    json.dumps(timeline, indent=2),
    encoding="utf-8"
)

print("✅ 컷 타이밍 분석 완료")
