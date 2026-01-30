function scoreTopic(candidate, history) {
  // 기본 점수: 과거에 잘 안 나온 주제일수록 +, 너무 최근 반복이면 -
  const recent = history.slice(-5).map(h => h.topic);
  const counts = new Map();
  for (const h of history) counts.set(h.topic, (counts.get(h.topic)||0)+1);

  let score = 100;
  const total = history.length || 1;
  const c = counts.get(candidate) || 0;

  // 희소성 보너스
  score += Math.max(0, 25 - Math.round((c/total)*100));

  // 최근 반복 패널티
  const recentCount = recent.filter(t => t === candidate).length;
  score -= recentCount * 20;

  return score;
}

export function nextTopics({ history, pool }) {
  const hist = Array.isArray(history) ? history : [];
  const candidates = Array.isArray(pool) && pool.length ? pool : [];

  // 후보가 없으면: history에서 키워드로 풀 생성
  let poolFinal = candidates;
  if (!poolFinal.length) {
    const kw = new Set();
    for (const h of hist) (h.keywords || []).forEach(k => kw.add(k));
    poolFinal = [...kw].slice(0, 50);
  }

  const scored = poolFinal
    .map(t => ({ topic: t, score: scoreTopic(t, hist) }))
    .sort((a,b)=>b.score-a.score)
    .slice(0, 10);

  return scored;
}
