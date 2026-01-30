// ===== CONFIG =====
const API_BASE = "https://history-inside-api.danielyoon.workers.dev";

// ===== DOM =====
const scriptInput = document.getElementById("scriptInput");

const btnValidate = document.getElementById("btnValidate");
const btnSplit = document.getElementById("btnSplit");

const summary = document.getElementById("validationSummary");
const errorList = document.getElementById("validationErrors");
const warningList = document.getElementById("validationWarnings");

const cutsTbody = document.getElementById("cutsTbody");

const btnDownloadCuts = document.getElementById("btnDownloadCuts");
const btnDownloadTTS = document.getElementById("btnDownloadTTS");
const btnDownloadPrompts = document.getElementById("btnDownloadPrompts");

const engineDot = document.getElementById("engineDot");
const engineStatus = document.getElementById("engineStatus");

// ===== STATE =====
let lastCuts = null;
let lastTTS = null;
let lastPrompts = null;

// ===== INIT =====
checkEngine();

// ===== ENGINE STATUS =====
async function checkEngine() {
  try {
    const res = await fetch(API_BASE, { method: "GET" });
    if (res.ok) {
      engineDot.style.background = "#4cd964";
      engineStatus.textContent = "ENGINE: ONLINE";
    } else {
      throw new Error();
    }
  } catch {
    engineDot.style.background = "#ff6b6b";
    engineStatus.textContent = "ENGINE: OFFLINE";
  }
}

// ===== HELPERS =====
function clearValidationUI() {
  errorList.innerHTML = "<li>없음</li>";
  warningList.innerHTML = "<li>없음</li>";
}

function setSummary(text, type) {
  summary.textContent = text;
  summary.className = `summary summary--${type}`;
}

function renderList(el, items) {
  if (!items.length) {
    el.innerHTML = "<li>없음</li>";
    el.classList.add("list--empty");
    return;
  }
  el.classList.remove("list--empty");
  el.innerHTML = items.map(i => `<li>${i}</li>`).join("");
}

function download(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== VALIDATE =====
btnValidate.addEventListener("click", async () => {
  const text = scriptInput.value.trim();
  if (!text) return;

  setSummary("검증 중…", "idle");
  clearValidationUI();

  try {
    const res = await fetch(`${API_BASE}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    renderList(errorList, data.errors || []);
    renderList(warningList, data.warnings || []);

    if (data.errors && data.errors.length) {
      setSummary("❌ FAIL", "fail");
      btnSplit.disabled = true;
    } else {
      setSummary(
        data.warnings && data.warnings.length
          ? "⚠️ PASS with WARNINGS"
          : "✅ PASS",
        "pass"
      );
      btnSplit.disabled = false;
    }
  } catch (e) {
    setSummary("❌ ENGINE ERROR", "fail");
  }
});

// ===== SPLIT =====
btnSplit.addEventListener("click", async () => {
  const text = scriptInput.value.trim();
  if (!text) return;

  cutsTbody.innerHTML = `
    <tr class="row--empty">
      <td colspan="5">컷 분할 중…</td>
    </tr>
  `;

  try {
    // 1. 컷 분할
    const res = await fetch(`${API_BASE}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const cutData = await res.json();
    lastCuts = cutData;

    // 2. EdgeTTS 텍스트
    const ttsRes = await fetch(`${API_BASE}/tts-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuts: cutData.cuts })
    });
    lastTTS = await ttsRes.json();

    // 3. 이미지 프롬프트
    const pRes = await fetch(`${API_BASE}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuts: cutData.cuts })
    });
    lastPrompts = await pRes.json();

    renderCuts(cutData.cuts);

    btnDownloadCuts.disabled = false;
    btnDownloadTTS.disabled = false;
    btnDownloadPrompts.disabled = false;

  } catch {
    cutsTbody.innerHTML = `
      <tr class="row--empty">
        <td colspan="5">❌ 컷 분할 실패</td>
      </tr>
    `;
  }
});

// ===== RENDER CUTS =====
function renderCuts(cuts) {
  cutsTbody.innerHTML = "";

  cuts.forEach(cut => {
    const len = cut.text.length;
    const tone =
      cut.errors && cut.errors.length
        ? "❌"
        : cut.warnings && cut.warnings.length
        ? "⚠️"
        : "OK";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>CUT ${cut.id}</td>
      <td>${cut.type}</td>
      <td>${len}</td>
      <td>${tone}</td>
      <td>${cut.text.slice(0, 80)}…</td>
    `;
    cutsTbody.appendChild(tr);
  });
}

// ===== DOWNLOADS =====
btnDownloadCuts.addEventListener("click", () => {
  if (!lastCuts) return;
  download("cuts.json", JSON.stringify(lastCuts, null, 2));
});

btnDownloadTTS.addEventListener("click", () => {
  if (!lastTTS) return;
  download("edge_tts_text.json", JSON.stringify(lastTTS, null, 2));
});

btnDownloadPrompts.addEventListener("click", () => {
  if (!lastPrompts) return;
  download("image_prompts.json", JSON.stringify(lastPrompts, null, 2));
});
