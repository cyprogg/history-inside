function extractKoreanWords(text) {
  const words = (text.match(/[가-힣]{2,}/g) || []);
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).map(([w])=>w);
}

export function makeMetadataFromCuts(cuts) {
  const all = cuts.map(c => c.text || c.tts_text || "").join(" ");
  const keywords = extractKoreanWords(all).slice(0, 20);
  const topic = keywords[0] || "역사의 전환";

  const titles = [
    `${topic}, 우리가 지금 서 있는 지점`,
    `${topic}은 왜 지금 다시 읽혀야 하는가`,
    `${topic} 이후, 세계는 이렇게 바뀌었다`
  ];

  const description =
`이 영상은 ${topic}을 통해
우리가 지금 어디쯤 와 있는지를 살펴봅니다.

✔ 주요 내용
- 배경과 맥락
- 당시의 선택
- 그 선택이 남긴 구조

지금 우리는 또 하나의 전환점에 서 있습니다.`;

  const fixed_comment =
`이 영상은 자극적인 결론을 제시하지 않습니다.
대신, “지금 우리는 어디쯤 와 있는가”라는 질문을 남깁니다.

여러분의 생각을 남겨주세요.`;

  // Shorts 스크립트(간단 버전): hook + 2~3개 문장 압축
  const hook = cuts.find(c => c.type === "hook")?.text || "";
  const ending = cuts.find(c => c.type === "ending")?.text || "";
  const shorts_script =
`${hook.trim()}
—
${ending.trim()}`.trim();

  const thumbnail_text = (topic.length <= 12) ? topic : topic.slice(0, 10);

  return {
    topic,
    keywords: keywords.slice(0, 15),
    titles,
    description,
    tags: keywords.slice(0, 15),
    fixed_comment,
    thumbnail_text,
    shorts_script
  };
}
