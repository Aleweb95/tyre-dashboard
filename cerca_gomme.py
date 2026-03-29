import webbrowser
import os
import time

def pulisci_schermo():
    """Pulisce la console in base al sistema operativo."""
    os.system('cls' if os.name == 'nt' else 'clear')

def stampa_intestazione():
    """Stampa l'intestazione del programma."""
    pulisci_schermo()
    print("=" * 60)
    print("   COMPARATORE PNEUMATICI B2B - VERSIONE AUTOMATIZZATA")
    print("   (Alzura / Tyre24 | Univergomma | Esapneus)")
    print("=" * 60)

def genera_url(larghezza, serie, cerchio):
    """
    Genera gli URL per i vari portali in base alle dimensioni dello pneumatico.
    """
    return {
        "Alzura / Tyre24": f"https://tyre24.alzura.com/it/it/tyre/search?w={larghezza}&s={serie}&r={cerchio}",
        "Univergomma": f"https://www.univergomma.it/shop/ricerca?lar={larghezza}&alt={serie}&dia={cerchio}",
        "Esapneus B2B": f"https://b2b.esapneus.it/ricerca?larghezza={larghezza}&serie={serie}&cerchio={cerchio}"
    }

def apri_siti(urls):
    """Apre gli URL generati nel browser predefinito."""
    print("\n[INFO] Apertura delle schede nel browser predefinito in corso...")
    for nome, url in urls.items():
        print(f" -> Apro {nome}...")
        webbrowser.open_new_tab(url)
        time.sleep(0.5) # Piccola pausa per non sovraccaricare il browser

def main():
    while True:
        stampa_intestazione()
        
        # Input dell'utente
        print("\nInserisci la misura dello pneumatico separata da spazi.")
        print("Esempio: 195 50 15")
        print("(Digita 'esci' o 'q' per chiudere il programma)")
        
        input_utente = input("\nMisura > ").strip().lower()
        
        if input_utente in ['esci', 'q', 'quit', 'exit']:
            print("\nChiusura del programma in corso. Arrivederci!")
            time.sleep(1)
            break
            
        parti = input_utente.split()
        
        # Validazione dell'input
        if len(parti) != 3:
            print("\n[ERRORE] Formato non valido. Assicurati di inserire 3 numeri separati da spazio.")
            input("Premi INVIO per riprovare...")
            continue
            
        larghezza, serie, cerchio = parti
        
        # Ulteriore validazione numerica (opzionale ma consigliata)
        if not (larghezza.isdigit() and serie.isdigit() and cerchio.isdigit()):
            print("\n[ERRORE] I valori inseriti devono essere numeri.")
            input("Premi INVIO per riprovare...")
            continue

        # Generazione URL e apertura
        urls = genera_url(larghezza, serie, cerchio)
        apri_siti(urls)
        
        print(f"\n[SUCCESSO] Ricerca completata per la misura {larghezza}/{serie} R{cerchio}.")
        print("Controlla il tuo browser. Ricorda che devi essere loggato sui portali B2B per vedere i prezzi.")
        
        input("\nPremi INVIO per effettuare una nuova ricerca...")

if __name__ == "__main__":
    main()
