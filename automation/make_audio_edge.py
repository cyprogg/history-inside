import json
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent
INPUT_JSON = BASE_DIR / "cuts_tts.json"
OUT_DIR = BASE_DIR / "audio"

OUT_DIR.mkdir(exist_ok=True)

with open(INPUT_JSON, encoding="utf-8") as f:
    data = json.load(f)

cuts = data.get("processed") or data.get("cuts") or data

for cut in cuts:
    cut_id = f"CUT{int(cut['id']):02d}"
    text = cut["tts_text"]

    wav_path = OUT_DIR / f"{cut_id}.wav"

    cmd = [
        "edge-tts",
        "--voice", "ko-KR-InJoonNeural",
        "--rate", "+0%",
        "--volume", "+0%",
        "--text", text,
        "--write-media", str(wav_path)
    ]

    subprocess.run(cmd, check=True)

print("✅ EdgeTTS 음성 생성 완료")
