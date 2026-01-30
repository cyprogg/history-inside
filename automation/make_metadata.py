import json

topic = "중산층 붕괴의 역사"

titles = [
    "역사에서 중산층이 사라질 때 반드시 반복된 패턴",
    "그때도 사람들은 아직 괜찮다고 말했다",
    "중산층은 언제부터 안전하지 않았을까"
]

description = f"""
이 영상은 특정 집단이나 개인을 비난하기 위한 콘텐츠가 아닙니다.
역사적 사례를 통해 반복되는 구조를 설명합니다.

주제: {topic}

#역사 #중산층 #문명 #HistoryInside
""".strip()

tags = ["역사", "인류사", "문명", "중산층", "사회구조"]

with open("metadata.json", "w", encoding="utf-8") as f:
    json.dump({
        "titles": titles,
        "description": description,
        "tags": tags
    }, f, ensure_ascii=False, indent=2)
