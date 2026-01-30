const API_URL = "https://history-inside-api.danielyoon.workers.dev";

document.querySelector("#testBtn").addEventListener("click", async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  console.log(data);

  document.querySelector("#output").textContent =
    JSON.stringify(data, null, 2);
});
