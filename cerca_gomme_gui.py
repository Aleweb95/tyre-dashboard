import tkinter as tk
from tkinter import messagebox, ttk
import webbrowser
import time
import json
import os

class TyreDashboardApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Tyre Dashboard - Comparatore B2B")
        self.root.geometry("450x450") # Aumentata l'altezza per far spazio allo storico
        self.root.resizable(False, False)
        
        self.file_storico = "storico_ricerche.json"
        self.ricerche_recenti = self.carica_storico()
        
        # Configurazione stile base
        self.font_title = ("Helvetica", 16, "bold")
        self.font_label = ("Helvetica", 12)
        self.font_input = ("Helvetica", 14)
        
        self.setup_ui()

    def setup_ui(self):
        # Titolo
        lbl_title = tk.Label(self.root, text="Ricerca Multi-Sito Pneumatici", font=self.font_title, pady=20)
        lbl_title.pack()

        # Frame per gli input
        frame_inputs = tk.Frame(self.root)
        frame_inputs.pack(pady=10)

        # Labels
        tk.Label(frame_inputs, text="Larghezza", font=self.font_label).grid(row=0, column=0, padx=10)
        tk.Label(frame_inputs, text="Serie", font=self.font_label).grid(row=0, column=1, padx=10)
        tk.Label(frame_inputs, text="Cerchio", font=self.font_label).grid(row=0, column=2, padx=10)

        # Input fields
        self.entry_larghezza = tk.Entry(frame_inputs, font=self.font_input, width=8, justify='center')
        self.entry_larghezza.grid(row=1, column=0, padx=10, pady=5)
        
        self.entry_serie = tk.Entry(frame_inputs, font=self.font_input, width=8, justify='center')
        self.entry_serie.grid(row=1, column=1, padx=10, pady=5)
        
        self.entry_cerchio = tk.Entry(frame_inputs, font=self.font_input, width=8, justify='center')
        self.entry_cerchio.grid(row=1, column=2, padx=10, pady=5)

        # Precompilazione per test rapido
        self.entry_larghezza.insert(0, "195")
        self.entry_serie.insert(0, "50")
        self.entry_cerchio.insert(0, "15")

        # Frame per lo storico
        frame_storico = tk.Frame(self.root)
        frame_storico.pack(pady=15)
        
        tk.Label(frame_storico, text="Ultime Ricerche:", font=self.font_label).pack(side=tk.LEFT, padx=5)
        
        self.combo_storico = ttk.Combobox(frame_storico, values=self.ricerche_recenti, width=15, font=self.font_label, state="readonly")
        self.combo_storico.pack(side=tk.LEFT, padx=5)
        self.combo_storico.bind("<<ComboboxSelected>>", self.carica_da_storico)

        # Bottone di ricerca
        btn_cerca = tk.Button(self.root, text="🔍 AVVIA RICERCA", font=("Helvetica", 14, "bold"), 
                              bg="#4CAF50", fg="white", activebackground="#45a049", 
                              command=self.avvia_ricerca, pady=10, width=20)
        btn_cerca.pack(pady=20)
        
        # Status Label
        self.lbl_status = tk.Label(self.root, text="Pronto.", font=("Helvetica", 10, "italic"), fg="gray")
        self.lbl_status.pack(side=tk.BOTTOM, pady=10)

        # Binding del tasto Invio
        self.root.bind('<Return>', lambda event: self.avvia_ricerca())

    def carica_storico(self):
        """Carica lo storico dal file JSON se esiste."""
        if os.path.exists(self.file_storico):
            try:
                with open(self.file_storico, 'r') as file:
                    return json.load(file)
            except:
                return []
        return []

    def salva_storico(self, misura_str):
        """Salva la nuova ricerca nello storico (max 10 elementi)."""
        if misura_str in self.ricerche_recenti:
            self.ricerche_recenti.remove(misura_str) # Sposta in cima se già esiste
        self.ricerche_recenti.insert(0, misura_str)
        
        if len(self.ricerche_recenti) > 10:
            self.ricerche_recenti = self.ricerche_recenti[:10]
            
        try:
            with open(self.file_storico, 'w') as file:
                json.dump(self.ricerche_recenti, file)
            # Aggiorna la combobox
            self.combo_storico['values'] = self.ricerche_recenti
        except Exception as e:
            print(f"Errore nel salvataggio dello storico: {e}")

    def carica_da_storico(self, event=None):
        """Popola i campi di input quando si seleziona una voce dallo storico."""
        selezione = self.combo_storico.get()
        if selezione:
            parti = selezione.split()
            if len(parti) == 3:
                self.entry_larghezza.delete(0, tk.END)
                self.entry_larghezza.insert(0, parti[0])
                self.entry_serie.delete(0, tk.END)
                self.entry_serie.insert(0, parti[1])
                self.entry_cerchio.delete(0, tk.END)
                self.entry_cerchio.insert(0, parti[2])

    def valida_input(self, l, s, r):
        if not all([l, s, r]):
            messagebox.showwarning("Errore", "Compila tutti i campi della misura!")
            return False
        if not (l.isdigit() and s.isdigit() and r.isdigit()):
            messagebox.showwarning("Errore", "Inserisci solo numeri!")
            return False
        return True

    def genera_url(self, l, s, r):
        return [
            f"https://tyre24.alzura.com/it/it/tyre/search?w={l}&s={s}&r={r}",
            f"https://www.univergomma.it/shop/ricerca?lar={l}&alt={s}&dia={r}",
            f"https://b2b.esapneus.it/ricerca?larghezza={l}&serie={s}&cerchio={r}"
        ]

    def avvia_ricerca(self):
        l = self.entry_larghezza.get().strip()
        s = self.entry_serie.get().strip()
        r = self.entry_cerchio.get().strip()

        if self.valida_input(l, s, r):
            self.lbl_status.config(text=f"Apertura siti per {l}/{s} R{r} in corso...", fg="blue")
            self.root.update() # Aggiorna la UI
            
            urls = self.genera_url(l, s, r)
            
            for url in urls:
                webbrowser.open_new_tab(url)
                time.sleep(0.3) # Piccola pausa per stabilità browser
                
            # Salva la ricerca nello storico
            misura_completa = f"{l} {s} {r}"
            self.salva_storico(misura_completa)
            
            self.lbl_status.config(text="Ricerca completata. Controlla il browser.", fg="green")

if __name__ == "__main__":
    root = tk.Tk()
    app = TyreDashboardApp(root)
    
    # Forza la finestra in primo piano all'avvio
    root.lift()
    root.attributes('-topmost',True)
    root.after_idle(root.attributes,'-topmost',False)
    
    root.mainloop()
