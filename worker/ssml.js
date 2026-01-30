export function makeSSML(text) {
  return `
<speak xml:lang="ko-KR">
  <prosody rate="92%" pitch="-2st">
    ${text}
  </prosody>
</speak>
`;
}
