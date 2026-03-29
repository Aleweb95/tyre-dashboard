// Questo script gira in background e ha il potere di aprire nuove schede (tabs)

chrome.runtime.onMessage.addListener(function(richiesta, sender, sendResponse) {
    
    if (richiesta.azione === "apri_siti_b2b") {
        
        const m = richiesta.misura;
        const l = m.larghezza;
        const s = m.serie;
        const r = m.cerchio;

        // I tre URL che conosciamo
        const urlAlzura = `https://tyre24.alzura.com/it/it/tyre/search?w=${l}&s=${s}&r=${r}`;
        const urlUniver = `https://www.univergomma.it/shop/ricerca?lar=${l}&alt=${s}&dia=${r}`;
        const urlEsapneus = `https://b2b.esapneus.it/ricerca?larghezza=${l}&serie=${s}&cerchio=${r}`;

        // Apriamo i tab in sequenza (senza farli diventare il tab attivo, così resti sul tuo sito)
        chrome.tabs.create({ url: urlAlzura, active: false });
        chrome.tabs.create({ url: urlUniver, active: false });
        chrome.tabs.create({ url: urlEsapneus, active: false });
        
        sendResponse({status: "Tabs aperti con successo!"});
    }
});