# Local Automation

## Requirements
- Python 3.10+
- moviepy
- edge-tts
- ffmpeg installed

## Install
pip install moviepy edge-tts

## Generate voice
edge-tts --voice ko-KR-InJoonNeural --ssml CUT03.ssml --write-media CUT03.wav

## Generate video
python make_video.py
