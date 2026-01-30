from moviepy.editor import *
import json

W, H = 1920, 1080

with open("data.json", encoding="utf-8") as f:
    cuts = json.load(f)

clips = []

for cut in cuts:
    audio = AudioFileClip(cut["audio"])
    img = ImageClip(cut["image"]).set_duration(audio.duration)

    txt = TextClip(
        cut["text"],
        fontsize=48,
        color="white",
        font="NanumGothic-Bold",
        stroke_color="black",
        stroke_width=2,
        size=(W*0.8, None),
        method="caption"
    ).set_position(("center", H*0.8)).set_duration(audio.duration)

    clips.append(
        CompositeVideoClip([img, txt], size=(W, H)).set_audio(audio)
    )

final = concatenate_videoclips(clips)
final.write_videofile("output.mp4", fps=24)
