export function optimizeForEdgeTTS(text, type) {
  let t = text.trim();
  t = t.replace(/\. /g, ".\n");

  if (type === "hook") {
    t = t.replace(/문제는/g, "\n문제는,").replace(/\n+/g, "\n\n");
  }

  t = t.split("\n").map(line =>
    line.length > 40 ? line.replace(/, /g, ",\n") : line
  ).join("\n");

  return t.trim();
}