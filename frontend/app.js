const API_BASE = "https://history-inside-api.danielyoon.workers.dev";

/* ---------- DOM ---------- */
const scriptInput = document.getElementById("scriptInput");
const btnValidate = document.getElementById("btnValidate");
const btnSplit = document.getElementById("btnSplit");
const validateResult = document.getElementById("validateResult");
const cutsGrid = document.getElementById("cutsGrid");

const ytTitles = document.getElementById("ytTitles");
const ytDescription = document.getElementById("ytDescription");
const ytTags = document.getElementById("ytTags");
const ytComment = document.getElementById("ytComment");
const ytThumbnailText = document.getElementById("ytThumbnailText");
const ytThumbnailImg = document.getElementById("ytThumbnailImg");
const ytShorts = document.getElementById("ytShorts");

const btnFinalize = document.getElementById("btnFinalize");
const btnExportZip = document.getElementById("btnExportZip");
const finalStatus = document.getElementById("finalStatus");
const nextTopics = document.getElementById("nextTopics");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

/* ---------- State ---------- */
let lastCuts = null;
let lastMeta = null;
let finalized = null;

/* ---------- Utils ---------- */
const pad2 = n => String(n).padStart(2, "0");

function assetPath(kind, cutId) {
  const id = pad2(cutId);
  if (kind === "audio") return `./audio/CUT${id}.wav`;
  if (kind === "srt") return `./srt/CUT${id}.srt`;
  if (kind === "prompt") return `./prompts/CUT${id}.prompt.txt`;
  return "#";
}

function downloadText(filename, text, mime = "application/json;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchOptionalBinary(path) {
  // Pages에 파일이 없을 수 있으므로, 있으면 가져오고 없으면 null
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/* ---------- Modal ---------- */
function openModal(title, text) {
  modalTitle.textContent = title;
  modalBody.textContent = text;
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}
modalClose.onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function openText(title, src) {
  openModal(title, "불러오는 중…");
  fetch(src)
    .then(r => r.text())
    .then(t => openModal(title, t))
    .catch(() => openModal(title, "파일을 찾을 수 없습니다."));
}
window.openText = openText;

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

  if (!res.ok) {
    validateResult.textContent = "검증 실패";
    return;
  }

  const data = await res.json();
  validateResult.textContent = JSON.stringify(data, null, 2);
};

/* ---------- Split + Package ---------- */
btnSplit.onclick = async () => {
  const text = scriptInput.value.trim();
  if (!text) return alert("대본이 비어 있습니다.");

  cutsGrid.innerHTML = `<div class="cutsEmpty">컷 분리 중…</div>`;

  const res = await fetch(`${API_BASE}/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    cutsGrid.innerHTML = `<div class="cutsEmpty">컷 분리 실패</div>`;
    return;
  }

  const data = await res.json();
  lastCuts = data.cuts;
  renderCutCards(lastCuts);

  await loadYouTubePackage(lastCuts);

  finalized = null;
  finalStatus.style.display = "none";
  nextTopics.textContent = "아직 FINAL이 실행되지 않았습니다.";
};

/* ---------- CUT Cards ---------- */
function renderCutCards(cuts) {
  if (!cuts || !cuts.length) {
    cutsGrid.innerHTML = `<div class="cutsEmpty">컷이 없습니다.</div>`;
    return;
  }

  cutsGrid.innerHTML = cuts.map(cut => {
    const id = pad2(cut.id);
    return `
      <div class="cutCard">
        <div class="cutCard__top">
          <span class="badge">CUT ${id}</span>
          <span class="badge">${cut.type}</span>
        </div>

        <audio controls preload="none" src="${assetPath("audio", cut.id)}"></audio>

        <div class="cutActions">
          <button onclick="openText('Subtitles','${assetPath("srt", cut.id)}')">📝 자막</button>
          <button onclick="openText('Image Prompt','${assetPath("prompt", cut.id)}')">🖼️ 이미지 프롬프트</button>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- YouTube Package ---------- */
async function loadYouTubePackage(cuts) {
  ytTitles.textContent = "불러오는 중…";
  ytDescription.textContent = "";
  ytTags.innerHTML = "";
  ytComment.textContent = "";
  ytThumbnailText.textContent = "–";
  ytShorts.textContent = "";

  const res = await fetch(`${API_BASE}/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cuts })
  });

  if (!res.ok) {
    ytTitles.textContent = "메타데이터 생성 실패";
    return;
  }

  const meta = await res.json();
  lastMeta = meta;

  // Titles radio
  ytTitles.innerHTML = meta.titles.map((t, i) => {
    return `<label style="display:block;margin:6px 0;">
      <input type="radio" name="ytTitle" value="${encodeURIComponent(t)}" ${i===0?"checked":""}/>
      ${t}
    </label>`;
  }).join("");

  ytDescription.textContent = meta.description || "";
  ytComment.textContent = meta.fixed_comment || "";
  ytThumbnailText.textContent = meta.thumbnail_text || "";
  ytShorts.textContent = meta.shorts_script || "";

  ytTags.innerHTML = (meta.tags || []).map(t => `<span class="tag">${t}</span>`).join("");

  // 썸네일 미리보기 (Pages에 있으면 보여줌)
  ytThumbnailImg.src = "./thumbnails/thumbnail.png";
}

/* ---------- FINAL: 상태 고정 + 로드맵 갱신 ---------- */
function loadHistoryLog() {
  try {
    return JSON.parse(localStorage.getItem("history_inside_log") || "[]");
  } catch {
    return [];
  }
}
function saveHistoryLog(log) {
  localStorage.setItem("history_inside_log", JSON.stringify(log));
}

function getSelectedTitle() {
  const el = document.querySelector('input[name="ytTitle"]:checked');
  if (!el) return (lastMeta?.titles?.[0] || "");
  return decodeURIComponent(el.value);
}

btnFinalize.onclick = async () => {
  if (!lastCuts || !lastCuts.length) return alert("먼저 Split to Cuts를 실행하세요.");
  if (!lastMeta) return alert("YouTube Package가 아직 생성되지 않았습니다.");

  const selectedTitle = getSelectedTitle();

  // episode id는 시간 기반 간단 생성(원하면 번호 체계로 교체 가능)
  const episodeId = new Date().toISOString().replace(/[-:]/g,"").slice(0, 13);

  finalized = {
    episode_id: episodeId,
    created_at: new Date().toISOString(),
    title: selectedTitle,
    thumbnail_text: lastMeta.thumbnail_text,
    tags: lastMeta.tags,
    description: lastMeta.description,
    fixed_comment: lastMeta.fixed_comment,
    shorts_script: lastMeta.shorts_script,
    topic: lastMeta.topic,
    keywords: lastMeta.keywords,
    cuts: lastCuts
  };

  // 1) 다운로드로 고정본 저장
  downloadText("episode_final.json", JSON.stringify(finalized, null, 2));

  // 2) history log 갱신(로컬)
  const log = loadHistoryLog();
  log.push({
    episode_id: finalized.episode_id,
    topic: finalized.topic,
    keywords: finalized.keywords,
    created_at: finalized.created_at
  });
  // 너무 커지면 최근 200개만 유지
  const trimmed = log.slice(-200);
  saveHistoryLog(trimmed);

  // 3) 로드맵 갱신 호출
  finalStatus.style.display = "block";
  finalStatus.textContent = "FINAL 처리 중… (로드맵 갱신)";

  // 후보 풀(간단): 이번 키워드 + 과거 키워드 합
  const pool = Array.from(new Set(trimmed.flatMap(x => x.keywords || []))).slice(0, 60);

  try {
    const res = await fetch(`${API_BASE}/roadmap-next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: trimmed, pool })
    });

    const data = await res.json();
    const lines = (data.next || []).map((x, i) => `${String(i+1).padStart(2,"0")}. ${x.topic} (score ${x.score})`).join("\n");
    nextTopics.textContent = lines || "추천 주제를 만들 수 없습니다.";

    finalStatus.textContent =
      `FINAL 완료\n- episode_id: ${finalized.episode_id}\n- title: ${finalized.title}\n- roadmap: updated`;
  } catch {
    finalStatus.textContent =
      `FINAL 완료(로컬 고정)\n- episode_id: ${finalized.episode_id}\n- title: ${finalized.title}\n\n로드맵 갱신 호출 실패`;
  }
};

/* ---------- Export ZIP: 패키지 한 번에 ---------- */
btnExportZip.onclick = async () => {
  if (!finalized) {
    return alert("먼저 FINAL을 눌러 episode_final.json을 고정하세요.");
  }

  if (typeof JSZip === "undefined") {
    return alert("JSZip 로딩 실패. index.html에 CDN 스크립트가 있어야 합니다.");
  }

  const zip = new JSZip();

  // 핵심 파일들
  zip.file("episode_final.json", JSON.stringify(finalized, null, 2));
  zip.file("cuts.json", JSON.stringify({ cuts: lastCuts }, null, 2));
  zip.file("youtube_metadata.json", JSON.stringify(lastMeta, null, 2));
  zip.file("shorts_script.txt", finalized.shorts_script || "");

  // 썸네일 파일(있으면 포함)
  const thumb = await fetchOptionalBinary("./thumbnails/thumbnail.png");
  if (thumb) zip.file("thumbnail.png", thumb);

  const thumbS = await fetchOptionalBinary("./thumbnails/thumbnail_shorts.png");
  if (thumbS) zip.file("thumbnail_shorts.png", thumbS);

  // ZIP 생성
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "history-inside-package.zip";
  a.click();
  URL.revokeObjectURL(url);
};
