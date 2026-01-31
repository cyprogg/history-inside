from pathlib import Path
import json
import subprocess
import sys

BASE = Path(__file__).resolve().parent
OUT_DIR = BASE / "output" / "audio"
OUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_JSON = BASE / "cuts_tts.json"

# ---------- load ----------
with open(INPUT_JSON, encoding="utf-8") as f:
    data = json.load(f)

if "processed" not in data or not isinstance(data["processed"], list):
    print("❌ cuts_tts.json에 'processed' 리스트가 없습니다.")
    sys.exit(1)

cuts = data["processed"]

if not cuts:
    print("❌ 처리할 컷이 없습니다.")
    sys.exit(1)

# ---------- generate audio ----------
for cut in cuts:
    cid = cut.get("id")
    text = cut.get("tts_text")

    if cid is None or not text:
        print("⏭ id 또는 tts_text 없음, 스킵")
        continue

    out_wav = OUT_DIR / f"CUT{int(cid):02}.wav"
    print(f"🎧 Generating {out_wav.name}")

    subprocess.run([
        "edge-tts",
        "--voice", "ko-KR-InJoonNeural",
        "--text", text,
        "--write-media", str(out_wav)
    ])
