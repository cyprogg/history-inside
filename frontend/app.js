const API_BASE = "https://history-inside-api.danielyoon.workers.dev";

/* ---------- DOM ---------- */
const scriptInput = document.getElementById("scriptInput");
const btnValidate = document.getElementById("btnValidate");
const btnSplit = document.getElementById("btnSplit");
const validateResult = document.getElementById("validateResult");
const cutsGrid = document.getElementById("cutsGrid");

/* YouTube Package */
const ytTitles = document.getElementById("ytTitles");
const ytDescription = document.getElementById("ytDescription");
const ytTags = document.getElementById("ytTags");
const ytComment = document.getElementById("ytComment");
const ytThumbnailText = document.getElementById("ytThumbnailText");
const ytThumbnailImg = document.getElementById("ytThumbnailImg");
const ytShorts = document.getElementById("ytShorts");

/* ---------- Utils ---------- */
const pad2 = n => String(n).padStart(2, "0");

function assetPath(kind, cutId) {
  const id = pad2(cutId);
  if (kind === "audio") return `./audio/CUT${id}.wav`;
  if (kind === "srt") return `./srt/CUT${id}.srt`;
  if (kind === "prompt") return `./prompts/CUT${id}.prompt.txt`;
  return "#";
}

/* ---------- Validate ---------- */
btnValidate.onclick = async () => {
  const text = scriptInput.value.trim();
  if (!text) return alert("대본이 비어 있습니다.");

  validateResult.style.display = "block";
  validateResult.textContent = "검증 중…";

  const res = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  validateResult.textContent = JSON.stringify(data, null, 2);
};

/* ---------- Split ---------- */
btnSplit.onclick = async () => {
  const text = scriptInput.value.trim();
  if (!text) return alert("대본이 비어 있습니다.");

  cutsGrid.innerHTML = `<div class="cutsEmpty">컷 분리 중…</div>`;

  const res = await fetch(`${API_BASE}/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  renderCutCards(data.cuts);

  // 👉 컷 분리 후 메타데이터 자동 요청
  await loadYouTubePackage(data.cuts);
};

/* ---------- CUT Cards ---------- */
function renderCutCards(cuts) {
  cutsGrid.innerHTML = cuts.map(cut => {
    const id = pad2(cut.id);
    return `
      <div class="cutCard">
        <div class="cutCard__top">
          <span class="badge">CUT ${id}</span>
          <span class="badge">${cut.type}</span>
        </div>

        <audio controls preload="none"
          src="${assetPath("audio", cut.id)}"></audio>

        <div class="cutActions">
          <button onclick="openText('Subtitles','${assetPath("srt", cut.id)}')">
            📝 자막
          </button>
          <button onclick="openText('Image Prompt','${assetPath("prompt", cut.id)}')">
            🖼️ 이미지 프롬프트
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- YouTube Package ---------- */
async function loadYouTubePackage(cuts) {
  const res = await fetch(`${API_BASE}/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cuts })
  });

  if (!res.ok) return;

  const meta = await res.json();

  // Titles
  ytTitles.innerHTML = meta.titles.map((t, i) =>
    `<label><input type="radio" name="title" ${i===0?"checked":""}> ${t}</label><br>`
  ).join("");

  ytDescription.textContent = meta.description;
  ytComment.textContent = meta.fixed_comment;
  ytThumbnailText.textContent = meta.thumbnail_text;
  ytThumbnailImg.src = "./thumbnails/thumbnail.png";
  ytShorts.textContent = meta.shorts_script || "Shorts 대본 없음";

  ytTags.innerHTML = meta.tags.map(t =>
    `<span class="tag">${t}</span>`
  ).join("");
}

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openText(title, src) {
  modalTitle.textContent = title;
  modalBody.textContent = "불러오는 중…";
  modal.classList.remove("hidden");

  fetch(src)
    .then(r => r.text())
    .then(t => modalBody.textContent = t)
    .catch(() => modalBody.textContent = "파일을 찾을 수 없습니다.");
}

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};
