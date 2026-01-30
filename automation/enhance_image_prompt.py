def enhance_prompt(cut):
    base = "18th century monochrome copperplate engraving"

    if cut["type"] == "hook":
        base += ", dramatic contrast, central figure"
    elif cut["type"] == "ending":
        base += ", distant view, empty space"

    length = len(cut["text"])
    if length > 500:
        base += ", detailed background"

    return base
