// dashboardjs.js (BACKEND REAL) — usa api.js + seu CSS (.bar-wrapper / .bar)

const ENUM_TO_LABEL = {
  QUEIMADA: "Queimada",
  DESMATAMENTO: "Desmatamento",
  POLUICAO: "Poluição",
  GARIMPO: "Garimpo",
  INVASAO: "Invasão",
  OUTROS: "Outros",
};

let currentStats = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setDefaultDates();
  loadDashboard();

  const btnAplicar = document.getElementById("applyFiltersBtn");
  if (btnAplicar) btnAplicar.addEventListener("click", loadDashboard);

  const btnPdf = document.getElementById("generatePdfBtn");
  if (btnPdf) btnPdf.addEventListener("click", handleGeneratePdf);
});

function setupMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });

  menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") menu.classList.remove("is-open");
  });
}

function setDefaultDates() {
  // padrão útil: últimos 30 dias
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);

  const startEl = document.getElementById("startDate");
  const endEl = document.getElementById("endDate");

  if (startEl) startEl.valueAsDate = start;
  if (endEl) endEl.valueAsDate = today;
}

async function loadDashboard() {
  try {
    const start = document.getElementById("startDate")?.value;
    const end = document.getElementById("endDate")?.value;
    const type = document.getElementById("typeFilter")?.value || "";

    if (!start || !end) {
      alert("Por favor, selecione as datas inicial e final");
      return;
    }

    setCardText("cardTotal", "...");
    setCardText("cardPeriod", "...");
    setCardText("cardTopType", "...");

    // ✅ chama backend real (api.js)
    // getSummaryStats(start,end) -> GET /api/stats/summary?start&end
    const stats = await getSummaryStats(start, end);
    currentStats = stats;

    // ⚠️ depende do formato que seu backend retorna
    // Vou suportar 2 formatos comuns:
    // A) { totalAll, totalPeriod, byType:[{type,count}], byMonth:[{month,count}] }
    // B) { total, byType:[...], byMonth:[...] } (onde total já é do período)
    const normalized = normalizeStats(stats);

    // Se o user selecionou type no filtro e o backend não filtra por type:
    // filtramos aqui no front por segurança
    const typeEnum = type ? type.toUpperCase() : null;
    const finalStats = typeEnum ? filterStatsByType(normalized, typeEnum) : normalized;

    displayStats(finalStats);
    renderChart(finalStats.byMonth);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    alert("Erro ao carregar estatísticas. Verifique backend/CORS e endpoint /stats/summary.");
  }
}

function normalizeStats(stats) {
  // Se seu backend já devolve totalAll/totalPeriod, ótimo
  if (stats && (stats.totalAll != null || stats.totalPeriod != null)) {
    return {
      totalAll: Number(stats.totalAll ?? stats.total ?? 0),
      totalPeriod: Number(stats.totalPeriod ?? stats.total ?? 0),
      byType: Array.isArray(stats.byType) ? stats.byType : [],
      byMonth: Array.isArray(stats.byMonth) ? stats.byMonth : [],
    };
  }

  // fallback: assume stats.total é do período
  return {
    totalAll: Number(stats?.total ?? 0),
    totalPeriod: Number(stats?.total ?? 0),
    byType: Array.isArray(stats?.byType) ? stats.byType : [],
    byMonth: Array.isArray(stats?.byMonth) ? stats.byMonth : [],
  };
}

function filterStatsByType(stats, typeEnum) {
  const byType = (stats.byType || []).filter((x) => x.type === typeEnum);
  const totalPeriod = byType.reduce((acc, x) => acc + Number(x.count || 0), 0);

  // byMonth geralmente já vem agregada geral; se seu backend não separa por tipo,
  // não tem como refazer mês por tipo só com o summary. Então:
  // - mantemos byMonth como está
  // - ajustamos cards do período/topType
  return {
    ...stats,
    totalPeriod,
    byType,
  };
}

function displayStats(stats) {
  setCardText("cardTotal", stats.totalAll);
  setCardText("cardPeriod", stats.totalPeriod);

  if (stats.byType && stats.byType.length > 0) {
    const top = stats.byType.reduce((max, item) => (item.count > max.count ? item : max));
    setCardText("cardTopType", `${formatType(top.type)} (${top.count})`);
  } else {
    setCardText("cardTopType", "—");
  }
}

function renderChart(monthData) {
  const chartBars = document.getElementById("chartBars");
  if (!chartBars) return;

  if (!monthData || monthData.length === 0) {
    chartBars.innerHTML = '<div class="chart-empty">Nenhum dado disponível para o período selecionado</div>';
    return;
  }

  const maxValue = Math.max(...monthData.map((m) => Number(m.count || 0)));

  chartBars.innerHTML = monthData
    .map((item) => {
      const count = Number(item.count || 0);
      const heightPx = maxValue > 0 ? (count / maxValue) * 250 : 4;
      return `
        <div class="bar-wrapper">
          <div class="bar-value">${count}</div>
          <div class="bar" style="height:${heightPx}px" title="${formatMonth(item.month)}: ${count} ocorrência(s)"></div>
          <div class="bar-label">${formatMonth(item.month)}</div>
        </div>
      `;
    })
    .join("");
}

async function handleGeneratePdf() {
  try {
    const start = document.getElementById("startDate")?.value;
    const end = document.getElementById("endDate")?.value;
    const type = document.getElementById("typeFilter")?.value || "";

    if (!start || !end) {
      alert("Por favor, selecione as datas");
      return;
    }

    const btn = document.getElementById("generatePdfBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Gerando PDF...";
    }

    // ✅ backend real (api.js) -> GET /api/reports/pdf?start&end&type?
    await generatePdfReport(start, end, type ? type.toUpperCase() : null);

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF: " + (error?.message || "erro"));
  } finally {
    const btn = document.getElementById("generatePdfBtn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "📄 Gerar Relatório PDF";
    }
  }
}

// HELPERS
function setCardText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function formatType(type) {
  return ENUM_TO_LABEL[type] || type || "—";
}

function formatMonth(monthStr) {
  // esperado "YYYY-MM"
  if (!monthStr || !monthStr.includes("-")) return String(monthStr || "—");
  const [year, month] = monthStr.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx] || month}/${year}`;
}
