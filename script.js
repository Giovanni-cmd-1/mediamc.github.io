const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

sendBtn.onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  chat.appendChild(div);
  typeText(div, text);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";

  const thinking = document.createElement("div");
  thinking.className = "msg bot";
  thinking.textContent = "Sto pensando… 🤔";
  chat.appendChild(thinking);

  const reply = await brain.reply(text);

  chat.removeChild(thinking);
  addMsg(reply, "bot");
}

function typeText(el, text) {
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i++];
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) clearInterval(timer);
  }, 15);
}
