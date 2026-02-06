const brain = {
  waitingForSummary: false,
  lastIntent: null,

  async reply(input) {
    const cleaned = this.clean(input);

    // Se stavamo aspettando il testo per il riassunto
    if (this.waitingForSummary) {
      this.waitingForSummary = false;
      const topic = cleaned || null;
      if (!topic) return "Non ho ricevuto testo da riassumere 😕";
      const fullText = await wikipediaSearch(topic);
      if (!fullText) return `Non ho trovato risultati su "${topic}" 😕`;
      return this.summarize(fullText, this.lastIntent.summaryLength || "breve");
    }

    const intent = this.detectIntent(cleaned);
    this.lastIntent = {intent};

    // controlla argomento
    const topic  = this.extractTopic(cleaned);

    switch (intent) {
      case "greeting":
        return this.greet();

      case "summary":
        // Controllo lunghezza riassunto
        this.lastIntent.summaryLength = this.detectSummaryLength(cleaned);
        if (topic) {
          const fullText = await wikipediaSearch(topic);
          if (!fullText) return `Non ho trovato risultati su "${topic}" 😕`;
          return this.summarize(fullText, this.lastIntent.summaryLength);
        } else {
          this.waitingForSummary = true;
          return "Sì certo! Mandami pure il testo o l’argomento 📄";
        }

      case "exercise":
        return this.handleExercise(topic);

      case "translate":
        return this.handleTranslate(cleaned);

      case "define":
        return await this.handleDefine(topic);

      case "trivia":
        return this.handleTrivia();

      case "recommend":
        return this.handleRecommend(topic);

      case "reminder":
        return this.handleReminder(cleaned);

      case "search":
        if (!topic) return "Su cosa vuoi informazioni?";
        return await wikipediaSearch(topic);

      default:
        return this.chatFreeStyle(cleaned);
    }
  },

  clean(text) {
    return text.toLowerCase().replace(/[^\w\sàèìòù']/g,"").replace(/\s+/g," ").trim();
  },

  detectIntent(text) {
    const intents = {
      greeting: ["ciao","hey","ehi","salve","buongiorno","buonasera"],
      summary: ["riassunto","breve","sintesi","in poche parole","riassumere","riassumi"],
      exercise: ["esercizi","fammi esercizi","allenamento","quiz","test","verifica"],
      translate: ["traduci","translation","translate"],
      define: ["definizione","definisci","cos'è","cos e"],
      trivia: ["curiosità","fatto divertente","fatti"],
      recommend: ["consigliami","raccomanda","lista libri","libri consigliati"],
      reminder: ["ricordami","promemoria"]
    };

    for (const intent in intents) {
      if(intents[intent].some(w => text.includes(w))) return intent;
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
    stop.forEach(w => topic = topic.replaceAll(w,""));
    topic = topic.trim();
    return topic.length>2 ? topic : null;
  },

  greet() {
    const responses = [
      "Ciao! 👋 Posso fare ricerche, riassunti o esercizi. Dimmi tu 😄",
      "Hey! Sono pronto a cercare, riassumere o creare esercizi 😎",
      "Salve! Cosa vuoi fare oggi? Ricerca, riassunto o esercizi?"
    ];
    return responses[Math.floor(Math.random()*responses.length)];
  },

  detectSummaryLength(text){
    if(text.includes("lungo")) return "lungo";
    if(text.includes("medio")) return "medio";
    return "breve";
  },

  summarize(text,length="breve"){
    const sentences = text.split(". ").filter(s => s.length>5);
    let count = 3;
    if(length==="medio") count = 5;
    if(length==="lungo") count = 8;
    return "📝 Riassunto\n\n"+sentences.slice(0,count).join(". ") + ".";
  },

  handleExercise(topic){
    if(!topic) topic="argomento generale";
    return `✏️ Esercizi su ${topic}:\n1) Spiega cos'è ${topic}.\n2) Elenca 3 punti chiave.\n3) Perché è importante?\n4) Fai un esempio pratico.`;
  },

  handleTranslate(text){
    const match = text.match(/traduci ['"](.*)['"] in (\w+)/i);
    if(!match) return "Dimmi cosa vuoi tradurre e in quale lingua 😉";
    const phrase = match[1];
    const lang = match[2].toLowerCase();
    if(lang==="inglese" || lang==="english") return `"${phrase}" → "${phrase}" in English`;
    if(lang==="francese" || lang==="french") return `"${phrase}" → "${phrase}" en Français`;
    return "Non conosco ancora questa lingua 😅";
  },

  async handleDefine(topic){
    if(!topic) return "Dimmi il termine da definire 😉";
    const fullText = await wikipediaSearch(topic);
    if(!fullText) return `Non ho trovato definizione su "${topic}" 😕`;
    const sentence = fullText.split(". ")[0];
    return `📖 Definizione di ${topic}: ${sentence}.`;
  },

  handleTrivia(){
    const facts = [
      "Lo sapevi che le api comunicano con la danza?",
      "La luna si allontana dalla Terra di circa 3,8 cm ogni anno.",
      "I polpi hanno tre cuori!",
      "Il miele non si rovina mai, anche dopo millenni."
    ];
    return facts[Math.floor(Math.random()*facts.length)];
  },

  handleRecommend(topic){
    if(!topic) topic="fantasy";
    const lists = {
      fantasy: ["Harry Potter","Il Signore degli Anelli","Cronache del Mondo Emerso","Eragon","Percy Jackson"],
      scienza: ["Breve Storia del Tempo","Cosmos","Il gene egoista","Sapiens","Il mondo ypsilon"]
    };
    return `📚 Consigli su ${topic}: ` + (lists[topic]||lists["fantasy"]).join(", ");
  },

  handleReminder(text){
    const match = text.match(/ricordami di (.*) tra (\d+) minuti/i);
    if(!match) return "Scrivi tipo: 'Ricordami di fare i compiti tra 5 minuti' 😉";
    const task = match[1];
    const min = parseInt(match[2]);
    setTimeout(()=> alert(`⏰ Promemoria: ${task}`), min*60*1000);
    return `Ok! Ti ricorderò di "${task}" tra ${min} minuti ⏰`;
  },

  chatFreeStyle(text){
    const responses = [
      "Interessante! Dimmi di più…",
      "Ah sì? Continua!",
      "Non ne ero a conoscenza, raccontami!",
      "Hmm, capisco 😄"
    ];
    return responses[Math.floor(Math.random()*responses.length)];
  }
};

// 🌍 Wikipedia
async function wikipediaSearch(topic){
  if(!topic) return null;
  try{
    const res = await fetch(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
    if(!res.ok) return null;
    const data = await res.json();
    return data.extract || null;
  }catch{
    return null;
  }
}
