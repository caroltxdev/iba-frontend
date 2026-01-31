
// consultarjs.js (BACKEND REAL) — usa api.js

// ============================
// MAPEAMENTOS (Front <-> Backend)
// ============================
const ENUM_TO_LABEL = {
  QUEIMADA: "Queimada",
  DESMATAMENTO: "Desmatamento",
  POLUICAO: "Poluição",
  GARIMPO: "Garimpo",
  INVASAO: "Invasão",
  OUTROS: "Outros",
};

// Seu select pode estar com labels tipo "Incêndio" etc.
// Ajuste conforme seu HTML do consultar:
const LABEL_TO_ENUM = {
  "Incêndio": "QUEIMADA",
  "Queimada": "QUEIMADA",
  "Desmatamento": "DESMATAMENTO",
  "Poluição": "POLUICAO",
  "Garimpo": "GARIMPO",
  "Invasão": "INVASAO",
  "Outros": "OUTROS",
  "Caça Ilegal": "OUTROS",
};

// ============================
// ESTADO
// ============================
let occurrencesCache = [];
let selectedId = null;

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupFilters();
  loadOccurrencesAndRender(); // carrega sem filtro inicialmente
});

function setupMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    // seu css do mobile usa .is-open
    menu.classList.toggle("is-open");
  });

  menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") menu.classList.remove("is-open");
  });
}

function setupFilters() {
  const btn = document.getElementById("btn-aplicar-filtros");
  const tipo = document.getElementById("filtro-tipo");
  const periodo = document.getElementById("filtro-periodo");

  if (btn) btn.addEventListener("click", applyFilters);
  if (tipo) tipo.addEventListener("change", applyFilters);
  if (periodo) periodo.addEventListener("change", applyFilters);

  const list = document.getElementById("lista-container");
  if (list) {
    list.addEventListener("click", (e) => {
      const card = e.target.closest(".ocorrencia-card");
      if (!card) return;

      const id = card.getAttribute("data-id");
      if (!id) return;

      selectedId = id;
      renderOccurrencesList();
      renderDetails(id);
    });
  }
}

// ============================
// CARREGAMENTO (BACKEND)
// ============================
async function loadOccurrencesAndRender(filters = {}) {
  try {
    setCounterText("Carregando...");

    // ✅ Usa a função real do api.js
    // listOccurrences(filters) -> GET /api/occurrences?type&start&end
    const data = await listOccurrences(filters);

    occurrencesCache = Array.isArray(data) ? data : [];
    occurrencesCache.sort((a, b) => new Date(b.date) - new Date(a.date));

    selectedId = occurrencesCache[0]?.id || null;

    renderOccurrencesList();
    renderDetails(selectedId);
    updateCounter(occurrencesCache.length);
  } catch (err) {
    console.error(err);
    setCounterText("Erro ao carregar");

    const container = document.getElementById("lista-container");
    if (container) {
      container.innerHTML =
        '<p style="padding:20px;text-align:center;">Erro ao carregar ocorrências. Verifique o backend e CORS.</p>';
    }

    const detalhes = document.getElementById("detalhes-container");
    if (detalhes) detalhes.innerHTML = "";
  }
}

function applyFilters() {
  const tipoLabel = document.getElementById("filtro-tipo")?.value || "";
  const periodo = parseInt(document.getElementById("filtro-periodo")?.value || "0", 10);

  const filters = {};

  // Tipo
  // Se seu select já manda ENUM (QUEIMADA etc), cai no else e funciona.
  if (tipoLabel) {
    const asEnum = LABEL_TO_ENUM[tipoLabel] || tipoLabel.toUpperCase();
    filters.type = asEnum;
  }

  // Período (últimos X dias)
  if (periodo > 0) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - periodo);

    filters.start = start.toISOString().slice(0, 10);
    filters.end = end.toISOString().slice(0, 10);
  }

  loadOccurrencesAndRender(filters);
}

// ============================
// RENDER
// ============================
function renderOccurrencesList() {
  const container = document.getElementById("lista-container");
  if (!container) return;

  if (!occurrencesCache.length) {
    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:#666;">
        <p>Nenhuma ocorrência encontrada</p>
        <p style="font-size:14px;margin-top:10px;">Tente ajustar os filtros</p>
      </div>
    `;
    return;
  }

  container.innerHTML = occurrencesCache
    .map((occ) => {
      const isActive = selectedId === occ.id ? "active" : "";
      return `
        <div class="ocorrencia-card ${isActive}" data-id="${escapeHtml(occ.id)}">
          <div class="ocorrencia-header">
            <span class="ocorrencia-tipo">${formatType(occ.type)}</span>
            <span class="ocorrencia-data">${formatDate(occ.date)}</span>
          </div>
          <p class="ocorrencia-desc">${escapeHtml(truncateText(occ.description || "", 100))}</p>
          <div class="ocorrencia-footer">
            <span class="ocorrencia-local">📍 ${safeNum(occ.latitude).toFixed(4)}, ${safeNum(occ.longitude).toFixed(4)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDetails(id) {
  const container = document.getElementById("detalhes-container");
  if (!container) return;

  if (!id) {
    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:#666;">
        <p>Selecione uma ocorrência para ver os detalhes</p>
      </div>
    `;
    return;
  }

  const occ = occurrencesCache.find((o) => String(o.id) === String(id));
  if (!occ) return;

  const lat = safeNum(occ.latitude);
  const lng = safeNum(occ.longitude);

  container.innerHTML = `
    <div class="detalhes-content">
      <div class="detalhes-header">
        <h2>${formatType(occ.type)}</h2>
        <span class="detalhes-badge">${formatDateTime(occ.date)}</span>
      </div>

      <div class="detalhes-section">
        <h3>Descrição</h3>
        <p>${escapeHtml(occ.description || "—")}</p>
      </div>

      <div class="detalhes-section">
        <h3>Localização</h3>
        <p><strong>Latitude:</strong> ${lat}</p>
        <p><strong>Longitude:</strong> ${lng}</p>

        <div class="detalhes-map">
          <iframe
            width="100%"
            height="250"
            style="border:0; border-radius:8px;"
            loading="lazy"
            allowfullscreen
            src="https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed">
          </iframe>
        </div>
      </div>

      ${
        occ.photoUrl
          ? `
          <div class="detalhes-section">
            <h3>Foto</h3>
            <img src="${escapeHtml(occ.photoUrl)}" alt="Foto da ocorrência" style="max-width:100%; border-radius:8px;">
          </div>
        `
          : ""
      }

      <div class="detalhes-section">
        <p style="font-size:12px;color:#666;">
          <strong>ID:</strong> ${escapeHtml(occ.id)}<br>
          <strong>Registrado em:</strong> ${formatDateTime(occ.createdAt || occ.date)}
        </p>
      </div>
    </div>
  `;
}

// ============================
// CONTADOR
// ============================
function updateCounter(count) {
  setCounterText(`${count} ocorrência${count !== 1 ? "s" : ""} encontrada${count !== 1 ? "s" : ""}`);
}

function setCounterText(text) {
  const contador = document.getElementById("contador-texto");
  if (contador) contador.textContent = text;
}

// ============================
// HELPERS
// ============================
function formatType(type) {
  return ENUM_TO_LABEL[type] || type || "—";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR");
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
