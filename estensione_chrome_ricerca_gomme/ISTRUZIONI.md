# Istruzioni Estensione Browser

Per far sì che la ricerca parta automaticamente dal **tuo sito web** e apra le altre tre schede, ho creato per te una piccola Estensione per Google Chrome (funziona anche su Microsoft Edge).

## Come installarla in 1 minuto (Senza passare dallo Store)

1. Apri Google Chrome o Edge.
2. Nella barra degli indirizzi digita: `chrome://extensions/` (o `edge://extensions/` se usi Edge) e premi Invio.
3. In alto a destra, attiva la levetta **"Modalità sviluppatore"** (Developer mode).
4. Appariranno tre nuovi pulsanti in alto a sinistra. Clicca su **"Carica estensione non pacchettizzata"** (Load unpacked).
5. Seleziona la cartella `estensione_chrome_ricerca_gomme` che si trova all'interno del tuo progetto sul PC.

L'estensione è ora installata e attiva!

## Cosa devi modificare nel codice per farla funzionare
Poiché non conosco l'indirizzo web del tuo sito né il codice HTML esatto, devi fare due piccole modifiche:

1. **Nel file `manifest.json`:**
   Sostituisci `"*://iltuosito.it/*"` con l'URL vero del tuo sito (es. `"*://b2b.esapneus.it/*"` se usi quello). Questo dice all'estensione "Attivati solo quando sono su questa pagina".

2. **Nel file `content.js`:**
   Dobbiamo dire all'estensione *dove* leggere i numeri che hai digitato e *quale* pulsante intercettare.
   Attualmente il codice cerca elementi con ID `#bottone-ricerca`, `#input-larghezza`, ecc. Dovrai ispezionare il tuo sito (tasto destro -> Ispeziona) per trovare i veri ID o classi HTML di quei campi e aggiornare il file `content.js`.

Se mi fornisci il link del sito da cui fai partire la ricerca (o uno screenshot del suo codice HTML), posso scriverti il codice di intercettazione esatto!