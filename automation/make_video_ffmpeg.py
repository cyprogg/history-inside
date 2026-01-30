import subprocess
from pathlib import Path

BASE = Path(__file__).parent
AUDIO = BASE / "audio"
IMG = BASE / "images"
BGM = BASE / "bgm/slow_ambient.mp3"
OUT = BASE / "video"
OUT.mkdir(exist_ok=True)

cuts = sorted(AUDIO.glob("CUT*.wav"))

for wav in cuts:
    cid = wav.stem
    img = IMG / f"{cid}.png"
    out = OUT / f"{cid}.mp4"

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", str(img),
        "-i", str(wav),
        "-i", str(BGM),
        "-filter_complex",
        "[2:a]volume=0.15[a2];[1:a][a2]amix=inputs=2",
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-shortest",
        str(out)
    ]

    subprocess.run(cmd, check=True)

# concat
list_file = OUT / "list.txt"
list_file.write_text(
    "\n".join([f"file '{p.name}'" for p in sorted(OUT.glob("CUT*.mp4"))]),
    encoding="utf-8"
)

subprocess.run([
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", str(list_file),
    "-c", "copy",
    str(BASE / "final.mp4")
], check=True)

print("🎬 최종 영상 생성 완료 → final.mp4")
