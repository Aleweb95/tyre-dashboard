/**
 * TYRE DASHBOARD - LOGICA EXPERT v1.0
 */

// CONFIGURAZIONE SITI B2B
const SITI_B2B = [
    { nome: "Esapneus", url: "https://b2b.esapneus.it/" },
    { nome: "Univergomma", url: "https://www.univergomma.it/" },
    { nome: "Alzura / Tyre24", url: "https://tyre24.alzura.com/" }
];

// STATO APPLICAZIONE
let magazzino = JSON.parse(localStorage.getItem('tyre_stock_expert')) || [];
let editId = null;

// INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    applyTheme(localStorage.getItem('tyre_theme') || 'default');
});

function initApp() {
    renderMagazzino();
    updateStats();
    document.getElementById('print-date').textContent = new Date().toLocaleDateString('it-IT', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

// GESTIONE TEMI
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tyre_theme', theme);
    document.getElementById('theme-selector').value = theme;
}

// RENDER MAGAZZINO
function renderMagazzino() {
    const query = document.getElementById('filter-misura').value.toLowerCase();
    const stagione = document.getElementById('filter-stagione').value;
    const prezzoMax = parseFloat(document.getElementById('filter-prezzo-max').value) || Infinity;

    const filtered = magazzino.filter(item => {
        const matchesQuery = item.misura.toLowerCase().includes(query) || 
                            item.marca.toLowerCase().includes(query) ||
                            item.modello.toLowerCase().includes(query);
        const matchesStagione = !stagione || item.stagione === stagione;
        const matchesPrezzo = (item.prezzo || 0) <= prezzoMax;
        return matchesQuery && matchesStagione && matchesPrezzo;
    });

    const bodyNuove = document.getElementById('magazzino-nuove-body');
    const bodyUsate = document.getElementById('magazzino-usate-body');
    
    bodyNuove.innerHTML = '';
    bodyUsate.innerHTML = '';

    filtered.forEach(item => {
        const row = createTableRow(item);
        if (item.condizione === 'Usata') {
            bodyUsate.appendChild(row);
        } else {
            bodyNuove.appendChild(row);
        }
    });
}

// LOGICA IQT (Rimossa)
function getStagioneIcon(s) {
    if (s === 'Estiva') return '☀️';
    if (s === 'Invernale') return '❄️';
    return '🌤️';
}

// COMPARATORE & PREVENTIVO
function calcolaPreventivo() {
    const pAlzura = parseFloat(document.getElementById('comp-alzura').value) || 0;
    const pUniver = parseFloat(document.getElementById('comp-univer').value) || 0;
    const pEsa = parseFloat(document.getElementById('comp-esa').value) || 0;
    
    const prezzi = [
        { nome: 'Alzura', val: pAlzura },
        { nome: 'Univergomma', val: pUniver },
        { nome: 'Esapneus', val: pEsa }
    ].filter(p => p.val > 0);

    const winnerBox = document.getElementById('b2b-winner');
    let bestPrice = 0;

    if (prezzi.length > 0) {
        const winner = prezzi.reduce((prev, curr) => prev.val < curr.val ? prev : curr);
        bestPrice = winner.val;
        winnerBox.style.display = 'block';
        winnerBox.innerHTML = `⭐ <strong>Miglior Fornitore: ${winner.nome}</strong> (€${winner.val.toFixed(2)})`;
    } else {
        winnerBox.style.display = 'none';
    }

    const marginePerc = parseFloat(document.getElementById('comp-margine').value) || 30;
    const montaggio = parseFloat(document.getElementById('comp-montaggio').value) || 0;
    const pfu = parseFloat(document.getElementById('comp-pfu').value) || 0;

    // Calcoli Clienti (Treno da 4)
    const prezzoVenditaUnitario = bestPrice * (1 + marginePerc / 100);
    const totGommeVendita = prezzoVenditaUnitario * 4;
    const granTotale = totGommeVendita + montaggio + pfu;
    
    // Margine Netto (Treno da 4)
    const margineNetto = (prezzoVenditaUnitario - bestPrice) * 4;

    // Update UI Preventivo
    document.getElementById('print-unitario').textContent = `€ ${prezzoVenditaUnitario.toFixed(2)}`;
    document.getElementById('print-tot-gomme').textContent = `€ ${totGommeVendita.toFixed(2)}`;
    document.getElementById('print-tot-montaggio').textContent = `€ ${montaggio.toFixed(2)}`;
    document.getElementById('print-tot-pfu').textContent = `€ ${pfu.toFixed(2)}`;
    document.getElementById('print-gran-totale').textContent = `€ ${granTotale.toFixed(2)}`;
    document.getElementById('print-margine-netto').textContent = `€ ${margineNetto.toFixed(2)}`;
}

function stampaPreventivo() {
    window.print();
}

// WORKFLOW B2B
function lanciaWorkspace() {
    const l = document.getElementById('search-larghezza').value;
    const s = document.getElementById('search-serie').value;
    const c = document.getElementById('search-cerchio').value;
    const marca = document.getElementById('search-marca').value;
    const modello = document.getElementById('search-modello').value;

    if (!l || !s || !c) {
        showToast("⚠️ Inserisci almeno la Misura completa!", "warning");
        return;
    }

    const screenW = window.screen.availWidth;
    const screenH = window.screen.availHeight;
    const winW = Math.floor(screenW / 3);
    const winH = screenH;

    // URL costruzione
    const urlEsa = `https://b2b.esapneus.it/it/Pneumatici/Ricerca?Larghezza=${l}&Serie=${s}&Diametro=${c}&Marca=${marca}&Modello=${modello}`;
    const urlUni = `https://www.univergomma.it/ricerca?l=${l}&s=${s}&d=${c}&branding=${marca}&pattern=${modello}`;
    const urlAlz = `https://tyre24.alzura.com/it/it/pneumatici/ricerca?width=${l}&series=${s}&diameter=${c}&manufacturer=${marca}&pattern=${modello}`;

    // Apertura 3 finestre affiancate
    window.open(urlEsa, 'EsaWindow', `width=${winW},height=${winH},left=0,top=0,resizable=yes,scrollbars=yes`);
    window.open(urlUni, 'UniWindow', `width=${winW},height=${winH},left=${winW},top=0,resizable=yes,scrollbars=yes`);
    window.open(urlAlz, 'AlzWindow', `width=${winW},height=${winH},left=${winW * 2},top=0,resizable=yes,scrollbars=yes`);
    
    showToast("🖥️ Workflow Splitscreen: 3 Finestre affiancate in caricamento...");
}

// EVENT LISTENERS & CRUD
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    document.getElementById('theme-selector').addEventListener('change', (e) => applyTheme(e.target.value));
    document.getElementById('btn-workspace').addEventListener('click', lanciaWorkspace);
    document.getElementById('btn-cerca-tutti').addEventListener('click', applyFilters);
    
    // Modal
    document.getElementById('btn-aggiungi').addEventListener('click', () => openModal());
    document.getElementById('btn-modal-cancel').addEventListener('click', () => closeModal());
    document.getElementById('form-gomma').addEventListener('submit', saveGomma);

    // Export / Import
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('btn-reset-demo').addEventListener('click', caricaDemo);
}

function openModal(item = null) {
    const modal = document.getElementById('modal-overlay');
    const form = document.getElementById('form-gomma');
    const title = document.getElementById('modal-title');
    
    if (item) {
        editId = item.id;
        title.textContent = "✏️ Modifica Gomma";
        Object.keys(item).forEach(key => {
            if (form[key]) form[key].value = item[key];
        });
    } else {
        editId = null;
        title.textContent = "➕ Nuova Gomma";
        form.reset();
        // Default values for IQT
        form.bagnato.value = "B";
        form.consumo.value = "B";
        form.rumore.value = "70";
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    editId = null;
}

function saveGomma(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const item = Object.fromEntries(data.entries());
    item.quantita = parseInt(item.quantita) || 0;
    item.prezzo = parseFloat(item.prezzo) || 0;
    item.rumore = parseInt(item.rumore) || 70;

    if (editId) {
        const idx = magazzino.findIndex(g => g.id === editId);
        magazzino[idx] = { ...item, id: editId };
    } else {
        item.id = Date.now().toString();
        magazzino.push(item);
    }

    saveAndRefresh();
    closeModal();
    showToast("✅ Stock aggiornato correttamente!");
}

function deleteGomma(id) {
    if (confirm("Sei sicuro di voler eliminare questo pneumatico?")) {
        magazzino = magazzino.filter(g => g.id !== id);
        saveAndRefresh();
    }
}

function openEditModal(id) {
    const item = magazzino.find(g => g.id === id);
    openModal(item);
}

function applyFilters() {
    renderMagazzino();
}

function saveAndRefresh() {
    localStorage.setItem('tyre_stock_expert', JSON.stringify(magazzino));
    renderMagazzino();
    updateStats();
}

function updateStats() {
    const totalPezzi = magazzino.reduce((sum, item) => sum + item.quantita, 0);
    const valore = magazzino.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0);
    const marche = new Set(magazzino.map(i => i.marca)).size;
    const misure = new Set(magazzino.map(i => i.misura)).size;

    document.getElementById('stat-pezzi').textContent = totalPezzi;
    document.getElementById('stat-valore').textContent = `€${valore.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
    document.getElementById('stat-marche').textContent = marche;
    document.getElementById('stat-misure').textContent = misure;
}

// UTILITÀ
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function exportData() {
    const blob = new Blob([JSON.stringify(magazzino, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_magazzino_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (Array.isArray(data)) {
                magazzino = data;
                saveAndRefresh();
                showToast("📥 Backup caricato con successo!");
            }
        } catch (err) {
            showToast("❌ Errore nel caricamento del file", "danger");
        }
    };
    reader.readAsText(file);
}

function caricaDemo() {
    magazzino = [
        { id: '1', misura: '225/45 R17', marca: 'Michelin', modello: 'Pilot Sport 5', quantita: 4, prezzo: 95, scaffale: 'A1', condizione: 'Nuova', stagione: 'Estiva' },
        { id: '2', misura: '205/55 R16', marca: 'Pirelli', modello: 'Cinturato P7', quantita: 2, prezzo: 70, scaffale: 'B3', condizione: 'Usata', stagione: 'Estiva' },
        { id: '3', misura: '195/65 R15', marca: 'Continental', modello: 'WinterContact', quantita: 4, prezzo: 85, scaffale: 'C2', condizione: 'Nuova', stagione: 'Invernale' }
    ];
    saveAndRefresh();
    showToast("🔄 Dati demo caricati!");
}

function applyFilters() {
    renderMagazzino();
}
window.applyFilters = applyFilters;
window.calcolaPreventivo = calcolaPreventivo;
window.stampaPreventivo = stampaPreventivo;
window.openEditModal = openEditModal;
window.deleteGomma = deleteGomma;
