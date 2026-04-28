document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const totalDemandes = document.getElementById("totalDemandes");
  const demandesEnCours = document.getElementById("enCours");
  const demandesTerminees = document.getElementById("terminees");
  const demandesRejetees = document.getElementById("rejetees");

  const totalClients = document.getElementById("totalClients");
  const totalAvis = document.getElementById("totalAvis");

  const recentRequestsTable = document.getElementById("recentRequestsTable");
  const logoutBtn = document.getElementById("logoutBtn");

  let adminChartInstance = null;

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
      const role = user?.user_metadata?.role || "client";

      if (role !== "admin") {
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
  // CHARGER DEMANDES
  // =====================================
  async function loadDemandes() {
    try {
      const { data, error } = await supabaseClient
        .from("demandes")
        .select("id, nom_complet, email, service, statut, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const demandes = data || [];

      let total = demandes.length;
      let enCours = 0;
      let terminees = 0;
      let rejetees = 0;

      demandes.forEach((item) => {
        const statut = (item.statut || "").toLowerCase();

        if (statut === "en_cours" || statut === "en cours") enCours++;
        if (statut === "terminee" || statut === "terminée") terminees++;
        if (statut === "rejetee" || statut === "rejetée") rejetees++;
      });

      if (totalDemandes) totalDemandes.textContent = total;
      if (demandesEnCours) demandesEnCours.textContent = enCours;
      if (demandesTerminees) demandesTerminees.textContent = terminees;
      if (demandesRejetees) demandesRejetees.textContent = rejetees;

      renderRecentRequests(demandes);
      renderChart(enCours, terminees, rejetees);

    } catch (err) {
      console.error("❌ Erreur chargement demandes :", err.message);

      if (recentRequestsTable) {
        recentRequestsTable.innerHTML = `
          <tr>
            <td colspan="4">Erreur lors du chargement des demandes</td>
          </tr>
        `;
      }
    }
  }

  // =====================================
  // CHARGER CLIENTS
  // =====================================
  async function loadClients() {
    try {
      const { count, error } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client");

      if (error) throw error;

      if (totalClients) {
        totalClients.textContent = count || 0;
      }

    } catch (err) {
      console.error("❌ Erreur chargement clients :", err.message);
    }
  }

  // =====================================
  // CHARGER AVIS
  // =====================================
  async function loadAvis() {
    try {
      const { count, error } = await supabaseClient
        .from("avis")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      if (totalAvis) {
        totalAvis.textContent = count || 0;
      }

    } catch (err) {
      console.error("❌ Erreur chargement avis :", err.message);
    }
  }

  // =====================================
  // TABLE DEMANDES RECENTES
  // =====================================
  function renderRecentRequests(demandes) {
    if (!recentRequestsTable) return;

    if (!demandes.length) {
      recentRequestsTable.innerHTML = `
        <tr>
          <td colspan="4">Aucune demande trouvée</td>
        </tr>
      `;
      return;
    }

    const limited = demandes.slice(0, 6);

    recentRequestsTable.innerHTML = limited.map((item) => `
      <tr>
        <td>${item.nom_complet || "-"}</td>
        <td>${item.service || "-"}</td>
        <td>${item.statut || "-"}</td>
        <td>${item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "-"}</td>
      </tr>
    `).join("");
  }

  // =====================================
  // CHART
  // =====================================
  function renderChart(enCours, terminees, rejetees) {
    const canvas = document.getElementById("adminDemandChart");

    if (!canvas || typeof Chart === "undefined") {
      console.warn("⚠️ Chart.js non chargé");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (adminChartInstance) {
      adminChartInstance.destroy();
    }

    adminChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["En cours", "Terminées", "Rejetées"],
        datasets: [{
          data: [enCours, terminees, rejetees],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
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

  await loadDemandes();
  await loadClients();
  await loadAvis();

});
