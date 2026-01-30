export function splitScriptToCuts(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => ({
    id: i + 1,
    type: i === 0 ? "hook" : i === paragraphs.length - 1 ? "ending" : "body",
    text: p
  }));
}
