from moviepy.editor import *
import json

W, H = 1080, 1920

with open("data.json", encoding="utf-8") as f:
    cuts = json.load(f)

short_clips = []

for cut in cuts[:3]:  # 상위 3컷만 쇼츠로
    audio = AudioFileClip(cut["audio"])
    duration = min(audio.duration, 25)

    img = (
        ImageClip(cut["image"])
        .resize(width=W)
        .set_duration(duration)
        .set_position("center")
    )

    txt = (
        TextClip(
            cut["text"],
            fontsize=64,
            color="white",
            stroke_color="black",
            stroke_width=2,
            method="caption",
            size=(W * 0.9, None)
        )
        .set_position(("center", H * 0.75))
        .set_duration(duration)
    )

    clip = CompositeVideoClip([img, txt], size=(W, H)).set_audio(audio.subclip(0, duration))
    short_clips.append(clip)

final = concatenate_videoclips(short_clips)
final.write_videofile("shorts.mp4", fps=30)
