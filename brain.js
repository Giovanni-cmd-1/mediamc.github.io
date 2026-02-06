const brain = {
  async reply(input) {
    const text = input.toLowerCase();

    // 1️⃣ SALUTI
    if (this.match(text, [
      "ciao", "hey", "ehi", "salve", "buongiorno", "buonasera"
    ])) {
      return "Ciao! 👋 Dimmi pure cosa vuoi fare: ricerca, riassunto o esercizi 😄";
    }

    // 2️⃣ ESERCIZI
    if (this.match(text, [
      "esercizi", "fammi esercizi", "crea esercizi",
      "allenamento", "test", "quiz"
    ])) {
      const topic = this.extractTopic(input);
      return this.makeExercises(topic);
    }

    // 3️⃣ RIASSUNTO
    if (this.match(text, [
      "riassunto", "breve", "in poche parole",
      "sintesi", "riassumere"
    ])) {
      const topic = this.extractTopic(input);
      const full = await wikipediaSearch(topic);
      return this.summarize(full);
    }

    // 4️⃣ RICERCA / SPIEGAZIONE
    const topic = this.extractTopic(input);
    if (topic) {
      return await wikipediaSearch(topic);
    }

    // fallback
    return "Non sono sicuro di aver capito 🤔 Puoi riscriverlo?";
  },

  match(text, words) {
    return words.some(w => text.includes(w));
  },

  extractTopic(text) {
    const stopWords = [
      "ciao","hey","ehi","salve","fammi","una","un","dei","degli",
      "riassunto","ricerca","esercizi","sulla","sul","su","mi","puoi",
      "per","favore","voglio","sapere","spiegami","parlami","che",
      "cos'è","cos e","breve","in","poche","parole","crea","test","quiz"
    ];

    text = text.toLowerCase();
    stopWords.forEach(w => text = text.replaceAll(w, ""));
    text = text.replace(/[^\w\s]/g, "").trim();

    return text.length > 2 ? text : null;
  },

  summarize(text) {
    const sentences = text.split(". ");
    return "📝 **Riassunto**\n\n" +
      sentences.slice(0, 3).join(". ") + ".";
  },

  makeExercises(topic) {
    if (!topic) topic = "argomento generale";

    return `✏️ **Esercizi su ${topic}**

1️⃣ Spiega con parole tue cos'è ${topic}.  
2️⃣ Elenca 3 caratteristiche principali di ${topic}.  
3️⃣ Perché ${topic} è importante?  
4️⃣ Scrivi un esempio pratico legato a ${topic}.  

Quando vuoi, puoi mandarmi le risposte 😉`;
  }
};

// 🔍 Wikipedia
async function wikipediaSearch(topic) {
  try {
    const res = await fetch(
      `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    const data = await res.json();

    return `📚 **${data.title}**\n\n${data.extract}`;
  } catch {
    return "Non ho trovato informazioni affidabili 😕";
  }
}
