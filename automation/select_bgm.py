def select_bgm(duration, cut_type):
    if duration < 20:
        return None
    if cut_type == "ending":
        return "fade_ambient.mp3"
    if duration < 40:
        return "low_drone.mp3"
    return "slow_ambient.mp3"
