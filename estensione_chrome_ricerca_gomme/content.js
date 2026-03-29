// Questo script "ascolta" il tuo sito per intercettare la ricerca.
// NOTA: Devi adattare i "selettori" al codice HTML reale del tuo sito web.

console.log("Estensione Auto-Ricerca B2B attiva su questa pagina.");

// Esempio: Intercettiamo il click sul pulsante "Cerca" del tuo sito
// Sostituisci '#bottone-ricerca', '#input-larghezza', ecc. con gli ID veri del tuo sito
const bottoneRicerca = document.querySelector('#bottone-ricerca');

if (bottoneRicerca) {
    bottoneRicerca.addEventListener('click', function(e) {
        
        // Estraiamo i valori che hai digitato sul tuo sito
        const l = document.querySelector('#input-larghezza').value;
        const s = document.querySelector('#input-serie').value;
        const r = document.querySelector('#input-cerchio').value;
        
        if (l && s && r) {
            // Inviamo i dati al "background" dell'estensione per far aprire i tab
            chrome.runtime.sendMessage({
                azione: "apri_siti_b2b",
                misura: { larghezza: l, serie: s, cerchio: r }
            });
        }
    });
}

// ALTERNATIVA: Se il tuo sito mette la misura nell'URL dopo la ricerca 
// (es: www.iltuosito.it/ricerca?w=205&s=55&r=16)
// Puoi intercettarla così:
/*
const urlParams = new URLSearchParams(window.location.search);
if(window.location.href.includes('/ricerca')) {
    const l = urlParams.get('w'); // Adatta il nome del parametro
    const s = urlParams.get('s');
    const r = urlParams.get('r');
    
    if(l && s && r) {
        chrome.runtime.sendMessage({
            azione: "apri_siti_b2b",
            misura: { larghezza: l, serie: s, cerchio: r }
        });
    }
}
*/