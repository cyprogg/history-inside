import shutil
from pathlib import Path

SRC = Path(__file__).resolve().parent / "output"
DST = Path(__file__).resolve().parent.parent / "frontend"

SUBDIRS = ["audio", "srt", "prompts", "thumbnails"]

def sync_dir(name):
    src = SRC / name
    dst = DST / name

    if not src.exists():
        print(f"⏭ skip {name} (source missing)")
        return

    dst.mkdir(parents=True, exist_ok=True)

    for f in src.iterdir():
        if f.is_file():
            shutil.copy2(f, dst / f.name)
            print(f"✔ copied {name}/{f.name}")

def main():
    print("📤 Publish automation outputs → Pages frontend")
    for d in SUBDIRS:
        sync_dir(d)
    print("✅ Publish complete")

if __name__ == "__main__":
    main()
