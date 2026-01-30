export function validateScript(text) {
  const errors = [];
  const warnings = [];

  const banned = ["충격", "소름", "대박", "레전드"];
  const absolutes = ["반드시", "무조건", "절대"];

  banned.forEach(w => {
    if (text.includes(w)) errors.push(`금지어 사용: ${w}`);
  });

  if (text.split("!").length > 3) errors.push("느낌표 과다 사용");

  const absCount = absolutes.reduce(
    (sum, w) => sum + (text.includes(w) ? 1 : 0),
    0
  );
  if (absCount >= 2) warnings.push("단정 표현 과다");

  return { errors, warnings };
}
