import re
import sys
from pathlib import Path

# ===== 설정 =====

BANNED_WORDS = [
    "충격", "소름", "대박", "믿을 수 없는",
    "레전드", "미친", "반전"
]

ABSOLUTE_WORDS = [
    "반드시", "무조건", "절대", "확실히"
]

STRUCTURE_PATTERNS = [
    "문제는",
    "이 패턴은",
    "사람들은 종종",
    "역사는 여기서",
    "이후"
]

OPEN_ENDINGS = [
    "지금 우리는",
    "이 질문은",
    "어쩌면",
    "다시 반복된다면"
]

# ==================

def validate(text: str):
    errors = []
    warnings = []

    # A. 금지어
    for w in BANNED_WORDS:
        if w in text:
            errors.append(f"금지어 사용: {w}")

    if text.count("!") >= 3:
        errors.append("느낌표 과다 사용")

    if any(x in text for x in ["구독", "좋아요", "여러분"]):
        errors.append("유튜브식 직접 호칭 사용")

    # B. 단정어
    count_abs = sum(text.count(w) for w in ABSOLUTE_WORDS)
    if count_abs >= 2:
        warnings.append("단정 표현 과다")

    # C. 구조
    structure_hits = sum(1 for p in STRUCTURE_PATTERNS if p in text)
    if structure_hits < 3:
        errors.append("History Inside 서술 구조 부족")

    # D. 열린 결말
    if not any(p in text for p in OPEN_ENDINGS):
        warnings.append("열린 결말 표현 부족")

    return errors, warnings


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ 사용법: python validate_script.py script.txt")
        sys.exit(1)

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")

    errors, warnings = validate(text)

    print("\n=== History Inside Script Validation ===\n")

    if errors:
        print("❌ FAIL")
        for e in errors:
            print(" -", e)
    else:
        print("✅ PASS")

    if warnings:
        print("\n⚠️ WARNINGS")
        for w in warnings:
            print(" -", w)

    print("\n======================================\n")

    sys.exit(1 if errors else 0)
