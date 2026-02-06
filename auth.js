let currentUser = null;
let currentKey = null;

// REGISTER
async function register() {
  const email = emailReg.value.trim();
  const pass = passReg.value.trim();
  if (!email || !pass) return alert("Compila tutti i campi!");
  if (localStorage.getItem("user_" + email)) return alert("Account già registrato ❌");

  const salt = crypto.randomUUID();
  const key = await deriveKey(pass, salt);
  localStorage.setItem("user_" + email, JSON.stringify({ salt }));
  sessionStorage.setItem("session", email);
  currentUser = email;
  currentKey = key;
  loadChat();
  toggleLoginChat(true);
}

// LOGIN
async function login() {
  const email = emailLog.value.trim();
  const pass = passLog.value.trim();
  if (!email || !pass) return alert("Compila tutti i campi!");
  const user = JSON.parse(localStorage.getItem("user_" + email));
  if (!user) return alert("Utente non registrato ❌");
  const key = await deriveKey(pass, user.salt);
  try {
    // prova a decifrare chat (se esiste) per verificare password
    const c = localStorage.getItem("chat_" + email);
    if (c) await decryptData(key, JSON.parse(c));
    currentUser = email;
    currentKey = key;
    loadChat();
    toggleLoginChat(true);
  } catch {
    alert("Password errata ❌");
  }
}

// PASSWORD DIMENTICATA (simulata)
function forgotPassword() {
  const email = prompt("Inserisci la tua email");
  if (!email) return;
  if (!localStorage.getItem("user_" + email)) return alert("Utente non trovato ❌");
  alert("Non posso inviare email 😅 ma puoi reinserire la password e perdere le vecchie chat");
}

// LOGOUT
function logout() {
  currentUser = null;
  currentKey = null;
  toggleLoginChat(false);
}

// Toggle UI
function toggleLoginChat(chatVisible) {
  document.getElementById("loginBox").style.display = chatVisible ? "none" : "block";
  document.getElementById("app").style.display = chatVisible ? "flex" : "none";
}
