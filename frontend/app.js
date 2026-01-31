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
const ytShorts = document.getElementById("ytShorts");

/* ---------- Utils ---------- */
const pad2 = n => String(n).padStart(2, "0");

function assetPath(kind, cutId) {
  const id = pad2(cutId);
  if (kind === "audio") return `./audio/CUT${id}.wav`;
  if (kind === "srt") return `./srt/CUT${id}.srt`;
  if (kind === "prompt") return `./prompts/CUT${id}.prompt.txt`;
  return "";
}

async function fileExists(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

/* ---------- Validate UI ---------- */
function showBox(type, html) {
  validateResult.className = `validateBox ${type}`;
  validateResult.innerHTML = html;
  validateResult.classList.remove("hidden");
}

function renderValidationResult({ errors = [], warnings = [] }) {
  if (errors.length > 0) {
    showBox("error", `❌ 검증 실패<br><ul>${errors.map(e=>`<li>${e}</li>`).join("")}</ul>`);
    return false;
  }
  if (warnings.length > 0) {
    showBox("warn", `⚠️ 경고 있음<br><ul>${warnings.map(w=>`<li>${w}</li>`).join("")}</ul>`);
    return true;
  }
  showBox("ok", "✅ 검증 통과 → 컷 분리 가능");
  return true;
}

/* ---------- Buttons ---------- */
btnValidate.onclick = async () => {
  const text = scriptInput.value.trim();
  if (!text) return alert("대본이 비어 있습니다.");

  showBox("warn", "검증 중…");

  const r = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await r.json();
  renderValidationResult(data);
};

btnSplit.onclick = async () => {
  const text = scriptInput.value.trim();
  if (!text) return alert("대본이 비어 있습니다.");

  // validate 먼저
  const vr = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const vdata = await vr.json();
  if (!renderValidationResult(vdata)) return;

  cutsGrid.innerHTML = `<div class="cutsEmpty">컷 분리 중…</div>`;

  // split
  const sr = await fetch(`${API_BASE}/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const { cuts } = await sr.json();
  renderCutCards(cuts);

  // 🔹 여기 중요: metadata 호출
  loadYouTubePackage(cuts);
};

/* ---------- CUT Cards ---------- */
async function renderCutCards(cuts) {
  if (!cuts.length) {
    cutsGrid.innerHTML = `<div class="cutsEmpty">컷 없음</div>`;
    return;
  }

  const cards = await Promise.all(cuts.map(async cut => {
    const id = pad2(cut.id);
    const audio = assetPath("audio", cut.id);
    const hasAudio = await fileExists(audio);

    return `
      <div class="cutCard">
        <div class="cutCard__top">
          <span class="badge">CUT ${id}</span>
          <span class="badge">${cut.type}</span>
        </div>

        ${hasAudio
          ? `<audio controls src="${audio}"></audio>`
          : `<div class="cutsEmpty">🔇 음성 아직 없음</div>`}

        <div class="cutActions">
          <button onclick="openText('자막','${assetPath("srt",cut.id)}')">📝 자막</button>
          <button onclick="openText('이미지 프롬프트','${assetPath("prompt",cut.id)}')">🖼️ 프롬프트</button>
        </div>
      </div>
    `;
  }));

  cutsGrid.innerHTML = cards.join("");
}

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

window.openText = async (title, src) => {
  modalTitle.textContent = title;
  modalBody.textContent = "불러오는 중…";
  modal.classList.remove("hidden");

  try {
    const r = await fetch(src);
    if (!r.ok) throw 0;
    modalBody.textContent = await r.text();
  } catch {
    modalBody.textContent = "아직 생성되지 않은 리소스입니다.";
  }
};

modalClose.onclick = () => modal.classList.add("hidden");

/* ---------- YouTube Package ---------- */
async function loadYouTubePackage(cuts) {
  ytTitles.innerHTML = "생성 중…";
  const r = await fetch(`${API_BASE}/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cuts })
  });

  const meta = await r.json();

  ytTitles.innerHTML = meta.titles.map(t=>`<div>• ${t}</div>`).join("");
  ytDescription.textContent = meta.description;
  ytComment.textContent = meta.fixed_comment;
  ytThumbnailText.textContent = meta.thumbnail_text;
  ytShorts.textContent = meta.shorts_script;
  ytTags.innerHTML = meta.tags.map(t=>`<span class="tag">${t}</span>`).join("");
}
