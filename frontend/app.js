const API = "https://your-worker.yourname.workers.dev";

async function splitCuts() {
  const script = document.getElementById("script").value;
  const res = await fetch(`${API}/split`, {
    method: "POST",
    body: JSON.stringify({ script }),
  });
  document.getElementById("output").textContent = await res.text();
}

async function generateSSML() {
  const text = document.getElementById("script").value;
  const res = await fetch(`${API}/ssml`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  document.getElementById("output").textContent = await res.text();
}

async function generatePrompts() {
  const text = document.getElementById("script").value;
  const res = await fetch(`${API}/prompt`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  document.getElementById("output").textContent = await res.text();
}
