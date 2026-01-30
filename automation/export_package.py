import argparse
import json
import subprocess
import sys
import zipfile
from pathlib import Path
from datetime import datetime

# ======================
# Config
# ======================
BASE_DIR = Path(__file__).resolve().parent
VIDEO_SCRIPT = BASE_DIR / "make_video_ffmpeg.py"

FINAL_VIDEO = BASE_DIR / "final.mp4"
EPISODE_JSON = BASE_DIR / "episode_final.json"
CUTS_JSON = BASE_DIR / "cuts.json"
META_JSON = BASE_DIR / "youtube_metadata.json"
SHORTS_TXT = BASE_DIR / "shorts_script.txt"

THUMBNAIL_MAIN = BASE_DIR / "thumbnails/thumbnail.png"
THUMBNAIL_SHORTS = BASE_DIR / "thumbnails/thumbnail_shorts.png"

OUTPUT_ZIP = BASE_DIR / f"history-inside-package-{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"


# ======================
# Utils
# ======================
def die(msg):
    print(f"\n❌ ERROR: {msg}")
    sys.exit(1)


def info(msg):
    print(f"• {msg}")


def ok(msg):
    print(f"✔ {msg}")


# ======================
# Step 1: Optional video build
# ======================
def run_video_build(skip):
    if skip:
        info("영상 자동 생성 스킵 (--skip-video)")
        return

    if not VIDEO_SCRIPT.exists():
        die("make_video_ffmpeg.py 파일이 없습니다.")

    info("final.mp4 자동 생성 시작")
    result = subprocess.run(
        [sys.executable, str(VIDEO_SCRIPT)],
        cwd=BASE_DIR
    )

    if result.returncode != 0:
        die("make_video_ffmpeg.py 실행 실패")

    if not FINAL_VIDEO.exists():
        die("make_video_ffmpeg.py 실행 후 final.mp4가 생성되지 않았습니다.")

    ok("final.mp4 생성 완료")


# ======================
# Step 2: Consistency check
# ======================
def load_json(path, name):
    if not path.exists():
        die(f"{name} 파일이 없습니다: {path.name}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        die(f"{name} JSON 파싱 실패: {e}")


def verify_consistency():
    info("정합성 검증 시작")

    episode = load_json(EPISODE_JSON, "episode_final.json")
    cuts_file = load_json(CUTS_JSON, "cuts.json")
    meta = load_json(META_JSON, "youtube_metadata.json")

    cuts_ep = episode.get("cuts", [])
    cuts_raw = cuts_file.get("cuts", [])

    if len(cuts_ep) != len(cuts_raw):
        die(f"컷 개수 불일치: episode({len(cuts_ep)}) vs cuts.json({len(cuts_raw)})")

    for i, (a, b) in enumerate(zip(cuts_ep, cuts_raw), start=1):
        if a.get("text") != b.get("text"):
            die(f"CUT {i} 텍스트 불일치")

    if episode.get("topic") != meta.get("topic"):
        die("episode_final.json과 youtube_metadata.json의 topic 불일치")

    ok("컷 / 메타데이터 / 에피소드 정합성 OK")


# ======================
# Step 3: Export ZIP
# ======================
def export_zip():
    info("ZIP 패키지 생성")

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(FINAL_VIDEO, arcname="final.mp4")
        z.write(EPISODE_JSON, arcname="episode_final.json")
        z.write(CUTS_JSON, arcname="cuts.json")
        z.write(META_JSON, arcname="youtube_metadata.json")
        z.write(SHORTS_TXT, arcname="shorts_script.txt")

        ok("필수 파일 포함")

        if THUMBNAIL_MAIN.exists():
            z.write(THUMBNAIL_MAIN, arcname="thumbnail.png")
            ok("thumbnail.png 포함")
        else:
            info("thumbnail.png 없음 (스킵)")

        if THUMBNAIL_SHORTS.exists():
            z.write(THUMBNAIL_SHORTS, arcname="thumbnail_shorts.png")
            ok("thumbnail_shorts.png 포함")
        else:
            info("thumbnail_shorts.png 없음 (스킵)")

    ok(f"패키지 생성 완료: {OUTPUT_ZIP.name}")


# ======================
# Main
# ======================
def main():
    parser = argparse.ArgumentParser(
        description="History Inside – Final Export Pipeline"
    )
    parser.add_argument(
        "--skip-video",
        action="store_true",
        help="final.mp4 자동 생성을 건너뜁니다"
    )
    args = parser.parse_args()

    print("\n📦 History Inside – Export Pipeline\n" + "-" * 40)

    run_video_build(skip=args.skip_video)
    verify_consistency()
    export_zip()

    print("-" * 40)
    print("✅ 모든 단계 완료")
    print("이 ZIP 하나로 업로드 가능합니다.\n")


if __name__ == "__main__":
    main()
