export function makeEngravingPrompt(cut) {
  return {
    id: cut.id,
    prompt: "18th century monochrome copperplate engraving, historical scene",
    negative_prompt: "modern, color, photo"
  };
}