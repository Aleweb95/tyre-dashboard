# ⚖️ Analisi di Fattibilità e Rischi Legali (Integrazione B2B)

Questo documento analizza la fattibilità tecnica e legale dell'integrazione del software "Tyre Dashboard" con i portali B2B Alzura, Univergomma ed Esapneus, in ottica di commercializzazione del prodotto.

---

## 🟢 1. L'Approccio "Safe" (L'attuale `cerca_gomme_gui.py`)
**Stato: 100% Legale e Consentito**

Il metodo attualmente sviluppato nell'interfaccia grafica si basa sull'**Automazione dell'Interfaccia Utente (Generazione URL)**.
*   **Come funziona:** Il software non entra nei server dei fornitori. Si limita a costruire un URL (es. `https://tyre24...`) e chiede al browser web dell'utente di aprirlo.
*   **Perché è legale:** È l'equivalente digitale di avere un assistente che digita i numeri sulla tastiera molto velocemente. I portali B2B vedono il traffico arrivare dal browser dell'utente (che ha già fatto il login manuale), quindi per loro è un traffico legittimo.
*   **Rischi:** Praticamente nulli. Il massimo che può succedere è che un portale cambi la struttura del suo URL (es. da `?w=205` a `?width=205`), richiedendo un piccolo aggiornamento del nostro script.

---

## 🔴 2. L'Approccio "Avanzato" (Lo Scraping invisibile dei prezzi)
**Stato: Rischioso / Spesso vietato dai TOS (Terms of Service)**

Se si decide di evolvere il software per fargli estrarre i prezzi di nascosto (senza aprire il browser) per creare una tabella comparativa netta:

### Analisi dei singoli portali:

#### 🚨 Alzura / Tyre24
*   **Politica:** Molto severa contro i bot e lo scraping.
*   **Difese:** Utilizzano sistemi come Cloudflare per bloccare richieste automatizzate.
*   **Il vero problema:** Alzura vende già l'accesso ai propri dati tramite **API ufficiali a pagamento**. Se tu crei uno scraper gratuito che ruba quei dati, violi i loro termini commerciali. Se ti scoprono, bloccano l'account B2B del gommista che sta usando il tuo software.

#### 🟡 Univergomma
*   **Politica:** Meno difese tecniche rispetto ad Alzura, ma i TOS standard vietano l'estrazione massiva di dati.
*   **Rischi:** Essendo un distributore diretto, se notano che un account fa 1.000 ricerche al minuto, potrebbero sospendere le credenziali per "traffico anomalo".

#### 🟠 Esapneus (Vismag)
*   **Politica:** Essendo basato su un gestionale ERP (X-Data), non è strutturato per ricevere scraping web tradizionale.
*   **Soluzione Ufficiale:** L'unico modo pulito per integrarsi con loro è richiedere un flusso dati (spesso un file CSV/XML aggiornato via FTP) concordato commercialmente con loro.

---

## 💡 3. Conclusioni e Strategia di Vendita

Se vuoi vendere questo software senza incorrere in problemi legali o causare blocchi agli account dei tuoi clienti, devi:

1.  **Vendere l'Approccio "Safe":** Proponi il software come uno strumento di "Assistenza alla Ricerca Rapida" (quello che abbiamo costruito). Dichiara chiaramente che l'utente deve usare le proprie credenziali nel proprio browser.
2.  **La Via delle API (Se vuoi crescere):** Se un domani vuoi vendere un prodotto "Premium" che mostra i prezzi direttamente nell'app, non usare lo scraping. Dovrai contattare Alzura e Univergomma come *Sviluppatore Software*, chiedere l'accesso alle loro API ufficiali, e far pagare ai tuoi clienti un abbonamento che copra i costi di queste licenze ufficiali.
