def validate_cut(text):
    errors = []
    warnings = []

    banned = ["충격", "소름", "대박", "레전드"]
    absolutes = ["반드시", "무조건", "절대"]

    for b in banned:
        if b in text:
            errors.append(f"금지어: {b}")

    if text.count("!") >= 2:
        errors.append("느낌표 과다")

    if sum(text.count(a) for a in absolutes) >= 2:
        warnings.append("단정 표현 과다")

    return errors, warnings
