const brain = {
  // stato della conversazione
  waitingForSummary: false,

  async reply(input) {
    const cleaned = this.clean(input);

    // Se stavamo aspettando il testo per il riassunto
    if (this.waitingForSummary) {
      this.waitingForSummary = false;
      if (!cleaned) return "Non ho ricevuto testo da riassumere 😕";
      return this.summarize(cleaned);
    }

    const intent = this.detectIntent(cleaned);
    const topic  = this.extractTopic(cleaned);

    switch (intent) {
      case "greeting":
        return this.greet();

      case "summary":
        // ora aspettiamo il testo
        this.waitingForSummary = true;
        return "Sì certo! Mandami pure il testo da riassumere 📄";

      case "exercise":
        return this.handleExercise(topic);

      case "search":
        return await this.handleSearch(topic);

      default:
        return "Ti ascolto 🙂 dimmi meglio cosa vuoi fare.";
    }
  },

  clean(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\sàèìòù]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  detectIntent(text) {
    const intents = {
      greeting: ["ciao","hey","ehi","salve","buongiorno","buonasera"],
      summary: ["riassunto","breve","sintesi","in poche parole","riassumere","riassumi"],
      exercise: ["esercizi","fammi esercizi","allenamento","quiz","test","verifica"]
    };

    for (const intent in intents) {
      if (intents[intent].some(w => text.includes(w))) return intent;
    }

    return "search";
  },

  extractTopic(text) {
    const stop = [
      "fammi","una","un","dei","degli","della","del",
      "riassunto","ricerca","esercizi","sulla","sul","su",
      "mi","puoi","per","favore","voglio","sapere",
      "spiegami","parlami","che","cosè","cose",
      "breve","in","poche","parole","crea","test","quiz"
    ];

    let topic = text;
    stop.forEach(w => topic = topic.replaceAll(w, ""));
    topic = topic.trim();
    return topic.length > 2 ? topic : null;
  },

  greet() {
    return "Ciao! 👋 Posso fare ricerche, riassunti o esercizi. Dimmi tu 😄";
  },

  async handleSearch(topic) {
    if (!topic) return "Su cosa vuoi informazioni?";
    return await wikipediaSearch(topic);
  },

  handleExercise(topic) {
    if (!topic) topic = "argomento generale";
    return `✏️ **Esercizi su ${topic}**\n
1) Spiega cos'è ${topic}.  
2) Elenca 3 punti chiave.  
3) Perché è importante?  
4) Fai un esempio pratico.`;
  },

  summarize(text) {
    if (!text) return "Non c'è nulla da riassumere 😕";
    const sentences = text.split(". ").filter(s => s.length > 5);
    return "📝 **Riassunto**\n\n" +
      sentences.slice(0, 3).join(". ") + ".";
  }
};

// 🌍 WIKIPEDIA (rimane opzionale)
async function wikipediaSearch(topic) {
  if (!topic) return null;
  try {
    const res = await fetch(
      `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.extract || null;
  } catch {
    return null;
  }
}
