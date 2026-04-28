document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const historiqueTable = document.getElementById("historiqueTable");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  // Stats
  const totalHistorique = document.getElementById("totalHistorique");
  const totalTerminees = document.getElementById("totalTerminees");
  const totalRejetees = document.getElementById("totalRejetees");

  let allHistoriques = [];

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // SESSION ADMIN
  // =====================================
  async function checkAdminSession() {
    try {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      if (error || !session) {
        window.location.href = "../auth/login.html";
        return null;
      }

      const user = session.user;

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.is_admin !== true) {
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      return user;

    } catch (err) {
      console.error("❌ Erreur session admin :", err.message);
      window.location.href = "../auth/login.html";
      return null;
    }
  }

  // =====================================
  // CHARGER HISTORIQUE
  // =====================================
  async function loadHistorique() {
    try {
      const { data, error } = await supabaseClient
        .from("demandes")
        .select(`
          id,
          nom_complet,
          email,
          telephone,
          service,
          description,
          localisation,
          statut,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // garder seulement terminées + rejetées
      allHistoriques = (data || []).filter(item => {
        const statut = normalizeStatus(item.statut);
        return statut === "terminee" || statut === "rejetee";
      });

      renderHistorique(allHistoriques);
      updateStats(allHistoriques);

    } catch (err) {
      console.error("❌ Erreur chargement historique :", err.message);

      historiqueTable.innerHTML = `
        <tr>
          <td colspan="8">
            Erreur lors du chargement de l'historique
          </td>
        </tr>
      `;
    }
  }

  // =====================================
  // AFFICHAGE TABLE
  // =====================================
  function renderHistorique(list) {
    if (!historiqueTable) return;

    if (!list.length) {
      historiqueTable.innerHTML = `
        <tr>
          <td colspan="8">
            Aucun historique disponible
          </td>
        </tr>
      `;
      return;
    }

    historiqueTable.innerHTML = list.map(item => `
      <tr>
        <td>${item.nom_complet || "-"}</td>
        <td>${item.email || "-"}</td>
        <td>${item.telephone || "-"}</td>
        <td>${item.service || "-"}</td>
        <td>${item.description || "-"}</td>
        <td>${item.localisation || "-"}</td>
        <td>
          ${
            item.created_at
              ? new Date(item.created_at).toLocaleDateString("fr-FR")
              : "-"
          }
        </td>
        <td>${formatStatus(item.statut)}</td>
      </tr>
    `).join("");
  }

  // =====================================
  // NORMALISER STATUT
  // =====================================
  function normalizeStatus(status) {
    const value = (status || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (value.includes("termine")) return "terminee";
    if (value.includes("rejete")) return "rejetee";
    if (value.includes("en cours") || value.includes("en_cours")) return "en_cours";

    return value;
  }

  // =====================================
  // FORMAT STATUT
  // =====================================
  function formatStatus(status) {
    const value = normalizeStatus(status);

    if (value === "terminee") return "Terminée";
    if (value === "rejetee") return "Rejetée";
    if (value === "en_cours") return "En cours";

    return status || "-";
  }

  // =====================================
  // STATS
  // =====================================
  function updateStats(list) {
    let total = list.length;
    let terminees = 0;
    let rejetees = 0;

    list.forEach(item => {
      const statut = normalizeStatus(item.statut);

      if (statut === "terminee") terminees++;
      if (statut === "rejetee") rejetees++;
    });

    if (totalHistorique) totalHistorique.textContent = total;
    if (totalTerminees) totalTerminees.textContent = terminees;
    if (totalRejetees) totalRejetees.textContent = rejetees;
  }

  // =====================================
  // FILTRES
  // =====================================
  function applyFilters() {
    const selectedStatus = statusFilter?.value || "";
    const searchValue = (searchInput?.value || "").toLowerCase();

    let filtered = [...allHistoriques];

    if (selectedStatus) {
      filtered = filtered.filter(item =>
        normalizeStatus(item.statut) === selectedStatus
      );
    }

    if (searchValue) {
      filtered = filtered.filter(item =>
        (item.nom_complet || "").toLowerCase().includes(searchValue) ||
        (item.email || "").toLowerCase().includes(searchValue)
      );
    }

    renderHistorique(filtered);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // =====================================
  // LOGOUT
  // =====================================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = "../auth/login.html";
    });
  }

  // =====================================
  // START
  // =====================================
  const user = await checkAdminSession();
  if (!user) return;

  await loadHistorique();

});