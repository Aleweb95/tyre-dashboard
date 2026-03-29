// ==============================================
//  TYRE DASHBOARD — App Logic
//  Configurato per: MIGLIORIR.html
// ==============================================

const SITI_B2B = {
  alzura: {
    nome: 'Alzura / Tyre24',
    buildUrl: (l, s, r) => `https://tyre24.alzura.com/it/it/tyre/search?w=${l}&s=${s}&r=${r}`,
    colore: 'alzura'
  },
  univergomma: {
    nome: 'Univergomma',
    buildUrl: (l, s, r) => `https://www.univergomma.it/shop/ricerca?lar=${l}&alt=${s}&dia=${r}`,
    colore: 'univergomma'
  },
  esapneus: {
    nome: 'Esapneus',
    buildUrl: (l, s, r) => `https://b2b.esapneus.it/ricerca?larghezza=${l}&serie=${s}&cerchio=${r}`,
    colore: 'esapneus'
  }
};

const IQT_SCORES = {
  bagnato:  { A: 5, B: 4, C: 3, D: 2, E: 1 },
  consumo:  { A: 3, B: 2, C: 1, D: 0, E: 0 },
  rumore: (db) => db <= 68 ? 3 : db <= 70 ? 2 : db <= 72 ? 1 : 0
};

const DEMO_DATA = [
  { id: 1, misura: '205/55 R16', marca: 'Michelin', modello: 'Primacy 4+', condizione: 'Nuova', stagione: 'Estiva', quantita: 4, prezzo: 65.00, scaffale: 'A1', bagnato: 'A', consumo: 'B', rumore: 68 },
  { id: 4, misura: '205/55 R16', marca: 'Goodyear', modello: 'Vector 4Seasons', condizione: 'Usata', stagione: '4 Stagioni', quantita: 3, prezzo: 30.00, scaffale: 'A1', bagnato: 'B', consumo: 'B', rumore: 71 }
];

let state = {
  magazzino: [],
  editingId: null,
  activeTab: 'magazzino',
  nextId: 100,
  currentFilters: { text: '', stag: '', maxPrice: NaN }
};

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadMagazzino();
  renderStats();
  renderTable();
  setupEventListeners();
  updatePrintDate();
});

function loadTheme() {
  const savedTheme = localStorage.getItem('tyreDashboard_theme') || 'default';
  setTheme(savedTheme);
  const sel = document.getElementById('theme-selector');
  if (sel) sel.value = savedTheme;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tyreDashboard_theme', theme);
}

function loadMagazzino() {
  const saved = localStorage.getItem('tyreDashboard_magazzino');
  if (saved) {
    state.magazzino = JSON.parse(saved);
  } else {
    state.magazzino = [...DEMO_DATA];
    saveMagazzino();
  }
}

function saveMagazzino() {
  localStorage.setItem('tyreDashboard_magazzino', JSON.stringify(state.magazzino));
}

function setupEventListeners() {
  document.getElementById('theme-selector')?.addEventListener('change', (e) => setTheme(e.target.value));
  document.getElementById('btn-cerca-tutti')?.addEventListener('click', cercaSuTutti);
  document.getElementById('btn-workspace')?.addEventListener('click', lanciaWorkspace);
  document.getElementById('btn-aggiungi')?.addEventListener('click', () => openModal());
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('form-gomma')?.addEventListener('submit', handleFormSubmit);
  document.getElementById('btn-calcola-iqt')?.addEventListener('click', calcolaIQT);
  document.getElementById('btn-export')?.addEventListener('click', exportMagazzino);
  document.getElementById('btn-import')?.addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file')?.addEventListener('change', importMagazzino);
  document.getElementById('btn-reset-demo')?.addEventListener('click', resetDemo);
  
  // Tabs manual click
  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => switchTab(t.dataset.tab);
  });
}

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
}

// === PREVENTIVATORE LOGIC ===
function calcolaPreventivo() {
  const pAlzura = parseFloat(document.getElementById('comp-alzura').value) || 0;
  const pUniver = parseFloat(document.getElementById('comp-univer').value) || 0;
  const pEsapneus = parseFloat(document.getElementById('comp-esa').value) || 0;
  
  const marginePerc = parseFloat(document.getElementById('comp-margine').value) || 0;
  const montaggio4 = parseFloat(document.getElementById('comp-montaggio').value) || 0;
  const pfu4 = parseFloat(document.getElementById('comp-pfu').value) || 0;

  // Trova il migliore
  const prezziValidi = [
    { nome: 'Alzura', prezzo: pAlzura },
    { nome: 'Univergomma', prezzo: pUniver },
    { nome: 'Esapneus', prezzo: pEsapneus }
  ].filter(x => x.prezzo > 0);

  let migliore = null;
  if (prezziValidi.length > 0) {
    migliore = prezziValidi.reduce((prev, curr) => (prev.prezzo < curr.prezzo) ? prev : curr);
  }

  const winnerEl = document.getElementById('b2b-winner');
  if (migliore) {
    winnerEl.style.display = 'block';
    winnerEl.innerHTML = `🏆 Fornitore Migliore: <strong>${migliore.nome}</strong> (€${migliore.prezzo.toFixed(2)})`;
    
    // Calcolo Prezzi
    const costoSingolo = migliore.prezzo;
    const ricarico = costoSingolo * (marginePerc / 100);
    const venditaSingola = costoSingolo + ricarico;
    
    const totGomme = venditaSingola * 4;
    const granTotale = totGomme + montaggio4 + pfu4;
    const margineNetto = (venditaSingola - costoSingolo) * 4;

    // Update UI
    document.getElementById('print-unitario').textContent = `€ ${venditaSingola.toFixed(2)}`;
    document.getElementById('print-tot-gomme').textContent = `€ ${totGomme.toFixed(2)}`;
    document.getElementById('print-tot-montaggio').textContent = `€ ${montaggio4.toFixed(2)}`;
    document.getElementById('print-tot-pfu').textContent = `€ ${pfu4.toFixed(2)}`;
    document.getElementById('print-gran-totale').textContent = `€ ${granTotale.toFixed(2)}`;
    document.getElementById('print-margine-netto').textContent = `€ ${margineNetto.toFixed(2)}`;
  } else {
    winnerEl.style.display = 'none';
  }
}

function stampaPreventivo() {
  updatePrintDate();
  window.print();
}

function updatePrintDate() {
  const d = new Date();
  document.getElementById('print-date').textContent = `Data: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
}

// === REST OF LOGIC (COMPACT) ===
function createTableRow(item) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="font-weight:700; color:var(--accent-1);">${item.misura}</td>
        <td><strong>${item.marca}</strong> <span style="font-size:0.8rem; opacity:0.7;">${item.modello}</span></td>
        <td>${getStagioneIcon(item.stagione)} ${item.stagione}</td>
        <td style="text-align:center;">${item.quantita}</td>
        <td>€${(item.prezzo || 0).toFixed(2)}</td>
        <td><code style="background:rgba(255,255,255,0.05); padding:2px 5px; border-radius:4px;">${item.scaffale || '-'}</code></td>
        <td>
            <div style="display:flex; gap:5px;">
                <button class="btn btn-secondary btn-sm" onclick="editGomma('${item.id}')">✏️</button>
                <button class="btn btn-secondary btn-sm" onclick="deleteGomma('${item.id}')" style="color:var(--danger);">🗑️</button>
            </div>
        </td>
    `;
    return tr;
}

function getStagioneIcon(s) {
    if (s === 'Estiva') return '☀️';
    if (s === 'Invernale') return '❄️';
    return '🌤️';
}

function applyFilters() {
  state.currentFilters = {
    text: document.getElementById('filter-misura').value.toLowerCase(),
    stag: document.getElementById('filter-stagione').value,
    maxPrice: parseFloat(document.getElementById('filter-prezzo-max').value)
  };
  renderTable();
}

function renderTable() {
  const f = state.currentFilters;
  const filtered = state.magazzino.filter(g => {
    if (f.text && !`${g.misura} ${g.marca} ${g.modello}`.toLowerCase().includes(f.text)) return false;
    if (f.stag && g.stagione !== f.stag) return false;
    if (!isNaN(f.maxPrice) && g.prezzo > f.maxPrice) return false;
    return true;
  });

  const render = (list, id) => {
    const body = document.getElementById(id);
    if (!body) return;
    body.innerHTML = '';
    if (list.length === 0) { body.innerHTML = '<tr><td colspan="7">Nessun dato</td></tr>'; return; }
    list.forEach(g => body.appendChild(createTableRow(g)));
  };

  render(filtered.filter(g => g.condizione === 'Nuova'), 'magazzino-nuove-body');
  render(filtered.filter(g => g.condizione === 'Usata'), 'magazzino-usate-body');
}

// B2B Search/Workspace
function cercaSuTutti() {
  const l = document.getElementById('search-larghezza').value;
  const s = document.getElementById('search-serie').value;
  const r = document.getElementById('search-cerchio').value;
  if (!l || !s || !r) return showToast('Inserisci misura', 'error');
  
  const resDiv = document.getElementById('stock-result');
  const found = state.magazzino.filter(g => g.misura.includes(`${l}/${s}`));
  resDiv.innerHTML = found.length ? `<div class="btn btn-success">✅ Trovate ${found.length} in magazzino</div>` : '<div class="btn btn-secondary">⚠️ Non in magazzino</div>';

  const sitesDiv = document.getElementById('site-buttons');
  sitesDiv.innerHTML = Object.entries(SITI_B2B).map(([k, x]) => `<a href="${x.buildUrl(l,s,r)}" target="_blank" class="btn btn-secondary">${x.nome}</a>`).join('');
}

function lanciaWorkspace() {
  const l = document.getElementById('search-larghezza').value;
  const s = document.getElementById('search-serie').value;
  const r = document.getElementById('search-cerchio').value;
  const w = Math.floor(window.screen.availWidth / 3);
  const h = window.screen.availHeight;
  window.open(SITI_B2B.esapneus.buildUrl(l,s,r), 'w1', `width=${w},height=${h},left=0`);
  window.open(SITI_B2B.univergomma.buildUrl(l,s,r), 'w2', `width=${w},height=${h},left=${w}`);
  window.open(SITI_B2B.alzura.buildUrl(l,s,r), 'w3', `width=${w},height=${h},left=${w*2}`);
}

// Modal handling
function openModal(g = null) {
  const f = document.getElementById('form-gomma');
  state.editingId = g ? g.id : null;
  if (g) {
    Object.keys(g).forEach(k => { if(f.elements[k]) f.elements[k].value = g[k]; });
  } else { f.reset(); }
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }
function handleFormSubmit(e) {
  e.preventDefault();
  const d = new FormData(e.target);
  const val = Object.fromEntries(d.entries());
  val.id = state.editingId || Date.now();
  val.quantita = parseInt(val.quantita);
  val.prezzo = parseFloat(val.prezzo);
  if (state.editingId) {
    const i = state.magazzino.findIndex(x => x.id === state.editingId);
    state.magazzino[i] = val;
  } else { state.magazzino.push(val); }
  saveMagazzino(); renderStats(); renderTable(); closeModal();
}
function deleteGomma(id) { if(confirm('Elimina?')){ state.magazzino = state.magazzino.filter(x => x.id !== id); saveMagazzino(); renderTable(); renderStats(); } }
function editGomma(id) { openModal(state.magazzino.find(x => x.id === id)); }
function calcolaIQT() { /* simple shell */ const b = document.getElementById('iqt-bagnato').value; const c = document.getElementById('iqt-consumo').value; const r = parseInt(document.getElementById('iqt-rumore').value); document.getElementById('iqt-result').innerHTML = `<div class="btn btn-primary">Score: ${calcIQTScore(b,c,r)}/10</div>`; }
function calcIQTScore(b,c,r) { return Math.round(((IQT_SCORES.bagnato[b]||0) + (IQT_SCORES.consumo[c]||0) + (IQT_SCORES.rumore(r))) / 11 * 10); }

// Generic tools
function showToast(m, t) { const c = document.getElementById('toast-container'); const e = document.createElement('div'); e.className = `btn btn-${t}`; e.textContent = m; c.appendChild(e); setTimeout(() => e.remove(), 3000); }
function renderStats() {
  document.getElementById('stat-pezzi').textContent = state.magazzino.reduce((a,b)=>a+b.quantita,0);
  document.getElementById('stat-valore').textContent = `€${state.magazzino.reduce((a,b)=>a+(b.prezzo*b.quantita),0).toFixed(0)}`;
  document.getElementById('stat-marche').textContent = [...new Set(state.magazzino.map(x=>x.marca))].length;
  document.getElementById('stat-misure').textContent = [...new Set(state.magazzino.map(x=>x.misura))].length;
}
function resetDemo() { if(confirm('Reset?')){ state.magazzino = [...DEMO_DATA]; saveMagazzino(); renderStats(); renderTable(); } }
function exportMagazzino() { const b = new Blob([JSON.stringify(state.magazzino)], {type:'application/json'}); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download='magazzino.json'; a.click(); }
function importMagazzino(e) { const r = new FileReader(); r.onload = (v) => { state.magazzino = JSON.parse(v.target.result); saveMagazzino(); renderStats(); renderTable(); }; r.readAsText(e.target.files[0]); }
