const API_URL = "https://api.losarchos.com";
const PUBLIC_KEY = "tb_demo_public_client_2025";

let bondSession = null;
let financeSession = null;

// --- Session Start ---
async function startSession(type) {
  const res = await fetch(`${API_URL}/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PUBLIC_KEY
    },
    body: JSON.stringify({})
  });
  const data = await res.json();
  if (type === "bond") bondSession = data.session_id;
  else financeSession = data.session_id;
}

// --- Generic Finance Chat ---
async function sendFinance() {
  const input = document.getElementById("finance-input");
  const box = document.getElementById("finance-chat-box");
  const msg = input.value.trim();
  if (!msg) return;
  box.innerHTML += `<div class="message user">You: ${msg}</div>`;
  input.value = "";

  if (!financeSession) await startSession("finance");

// show typing indicator
const thinking = document.createElement("div");
thinking.className = "typing-indicator";
thinking.textContent = "thinking...";
box.appendChild(thinking);
box.scrollTop = box.scrollHeight;

const res = await fetch(`${API_URL}/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": PUBLIC_KEY
  },
  body: JSON.stringify({
    prompt: msg,
    options: { num_predict: 800 }
  })
});

// remove indicator after response
box.removeChild(thinking);

const data = await res.json();
box.innerHTML += `
  <div class="message assistant">
    <span class="label"></span> ${marked.parse(data.response || data.reply || "")}
  </div>
`;
box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });

}

// --- Bond Structuring Chat ---
async function sendBond() {
  const input = document.getElementById("bond-input");
  const box = document.getElementById("bond-chat-box");
  const msg = input.value.trim();
  if (!msg) return;
  box.innerHTML += `<div class="message user">You: ${msg}</div>`;
  input.value = "";

  if (!bondSession) await startSession("bond");

const thinking = document.createElement("div");
thinking.className = "typing-indicator";
thinking.textContent = "analyzing...";
box.appendChild(thinking);
box.scrollTop = box.scrollHeight;

const res = await fetch(`${API_URL}/chat`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": PUBLIC_KEY
  },
  body: JSON.stringify({
    session_id: bondSession,
    message: msg,
    options: { num_predict: 900 }
  })
});

box.removeChild(thinking);

const data = await res.json();
const reply = data.final_report || data.reply || "(no response)";
box.innerHTML += `
  <div class="message assistant">
    <span class="label"></span> ${marked.parse(reply)}
  </div>
`;
box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });

}

const modal = document.getElementById("bondGuideModal");
const openBtn = document.getElementById("openGuideBtn");
const closeBtns = [document.getElementById("closeGuideBtn"), document.getElementById("closeGuideBtn2")];

if (openBtn && modal) {
  openBtn.onclick = () => modal.style.display = "block";
}
closeBtns.forEach(btn => {
  if (btn) btn.onclick = () => modal.style.display = "none";
});
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};