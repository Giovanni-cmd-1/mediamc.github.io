// RIFERIMENTI ELEMENTI
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");

// INVIO MESSAGGIO
sendBtn.onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// NUOVA CHAT
newChatBtn.onclick = () => {
  chat.innerHTML = "";
  addBotMsg("Ciao! 👋 Posso fare ricerche, riassunti o esercizi. Dimmi tu 😄");
  input.value = "";
};

// AGGIUNGE MESSAGGIO UTENTE
function addUserMsg(text) {
  addMsg(text, "user");
}

// AGGIUNGE MESSAGGIO BOT
function addBotMsg(text) {
  addMsg(text, "bot");
}

// FUNZIONE GENERICA PER AGGIUNGERE MESSAGGIO
function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  chat.appendChild(div);
  typeText(div, text);
}

// EFFETTO TYPING
function typeText(el, text) {
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i++];
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) clearInterval(timer);
  }, 15);
}

// FUNZIONE INVIO PRINCIPALE
async function send() {
  const text = input.value.trim();
  if (!text) return;

  addUserMsg(text);  // mostra messaggio utente
  input.value = "";

  // messaggio "thinking..."
  const thinking = document.createElement("div");
  thinking.className = "msg bot";
  thinking.textContent = "Sto pensando… 🤔";
  chat.appendChild(thinking);
  chat.scrollTop = chat.scrollHeight;

  // ottiene risposta dal brain
  const reply = await brain.reply(text);

  chat.removeChild(thinking);
  addBotMsg(reply);
}
