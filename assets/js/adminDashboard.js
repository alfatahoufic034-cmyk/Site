document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const totalDemandes = document.getElementById("totalDemandes");
  const enCours = document.getElementById("enCours");
  const terminees = document.getElementById("terminees");
  const rejetees = document.getElementById("rejetees");

  const totalClients = document.getElementById("totalClients");
  const totalAvis = document.getElementById("totalAvis");
  const todayDemandes = document.getElementById("todayDemandes");

  const recentRequestsTable = document.getElementById("recentRequestsTable");
  const logoutBtn = document.getElementById("logoutBtn");

  let demandChartInstance = null;

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // VERIFICATION SESSION ADMIN
  // =====================================
  async function checkAdminSession() {
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabaseClient.auth.getSession();

      if (sessionError || !session) {
        window.location.href = "../auth/login.html";
        return null;
      }

      const user = session.user;

      if (!user) {
        window.location.href = "../auth/login.html";
        return null;
      }

      // Vérification admin dans profiles
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Erreur vérification admin :", profileError.message);

        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      if (!profile || profile.is_admin !== true) {
        console.warn("⛔ Accès refusé : utilisateur non admin");

        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      console.log("✅ Session admin validée :", user.email);
      return user;

    } catch (err) {
      console.error("❌ Erreur session admin :", err.message);

      await supabaseClient.auth.signOut();
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
        .select(`
          id,
          nom_complet,
          email,
          service,
          statut,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const demandes = data || [];

      console.log("📦 Demandes chargées :", demandes);

      let total = demandes.length;
      let countEnCours = 0;
      let countTerminees = 0;
      let countRejetees = 0;

      demandes.forEach((item) => {
        const status = (item.statut || "").toLowerCase().trim();

        if (
          status === "en_cours" ||
          status === "en cours" ||
          status === "encours"
        ) {
          countEnCours++;
        }

        if (
          status === "terminee" ||
          status === "terminée"
        ) {
          countTerminees++;
        }

        if (
          status === "rejetee" ||
          status === "rejetée"
        ) {
          countRejetees++;
        }
      });

      // Affichage stats
      if (totalDemandes) totalDemandes.textContent = total;
      if (enCours) enCours.textContent = countEnCours;
      if (terminees) terminees.textContent = countTerminees;
      if (rejetees) rejetees.textContent = countRejetees;

      // Fonctions supplémentaires
      renderRecentRequests(demandes);
      loadTodayDemandes(demandes);
      renderChart(
        countEnCours,
        countTerminees,
        countRejetees
      );

    } catch (err) {
      console.error("❌ Erreur chargement demandes :", err.message);

      if (totalDemandes) totalDemandes.textContent = "0";
      if (enCours) enCours.textContent = "0";
      if (terminees) terminees.textContent = "0";
      if (rejetees) rejetees.textContent = "0";
      if (todayDemandes) todayDemandes.textContent = "0";

      if (recentRequestsTable) {
        recentRequestsTable.innerHTML = `
          <tr>
            <td colspan="5">
              Erreur lors du chargement des demandes
            </td>
          </tr>
        `;
      }

      renderChart(0, 0, 0);
    }
  }

  // =====================================
  // CHARGER CLIENTS
  // =====================================
  async function loadClients() {
    try {
      const { count, error } = await supabaseClient
        .from("profiles")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("is_admin", false);

      if (error) throw error;

      if (totalClients) {
        totalClients.textContent = count || 0;
      }

      console.log("👥 Total clients :", count);

    } catch (err) {
      console.error("❌ Erreur chargement clients :", err.message);

      if (totalClients) {
        totalClients.textContent = "0";
      }
    }
  }

  // =====================================
  // CHARGER AVIS
  // =====================================
  async function loadAvis() {
    try {
      const { count, error } = await supabaseClient
        .from("avis")
        .select("*", {
          count: "exact",
          head: true
        });

      if (error) throw error;

      if (totalAvis) {
        totalAvis.textContent = count || 0;
      }

      console.log("⭐ Total avis :", count);

    } catch (err) {
      console.error("❌ Erreur chargement avis :", err.message);

      if (totalAvis) {
        totalAvis.textContent = "0";
      }
    }
  }

  // =====================================
  // NOUVELLES DEMANDES DU JOUR
  // =====================================
  function loadTodayDemandes(demandes) {
    if (!todayDemandes) return;

    const today = new Date();

    const todayCount = demandes.filter((item) => {
      if (!item.created_at) return false;

      const createdDate = new Date(item.created_at);

      return (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    }).length;

    todayDemandes.textContent = todayCount;
  }

  // =====================================
  // TABLE DES DEMANDES RECENTES
  // =====================================
  function renderRecentRequests(demandes) {
    if (!recentRequestsTable) return;

    if (!demandes.length) {
      recentRequestsTable.innerHTML = `
        <tr>
          <td colspan="5">
            Aucune demande trouvée
          </td>
        </tr>
      `;
      return;
    }

    const limited = demandes.slice(0, 6);

    recentRequestsTable.innerHTML = limited.map((item) => `
      <tr>
        <td>${item.nom_complet || "-"}</td>
        <td>${item.service || "-"}</td>
        <td>
          ${
            item.created_at
              ? new Date(item.created_at).toLocaleDateString("fr-FR")
              : "-"
          }
        </td>
        <td>${formatStatus(item.statut)}</td>
        <td>
          <a href="demandes.html">Voir</a>
        </td>
      </tr>
    `).join("");
  }

  // =====================================
  // FORMAT STATUS
  // =====================================
  function formatStatus(status) {
    const value = (status || "").toLowerCase().trim();

    if (
      value === "en_cours" ||
      value === "en cours" ||
      value === "encours"
    ) {
      return "En cours";
    }

    if (
      value === "terminee" ||
      value === "terminée"
    ) {
      return "Terminée";
    }

    if (
      value === "rejetee" ||
      value === "rejetée"
    ) {
      return "Rejetée";
    }

    return status || "-";
  }

  // =====================================
  // CHART.JS
  // =====================================
  function renderChart(
    enCoursValue,
    termineesValue,
    rejeteesValue
  ) {
    const canvas = document.getElementById("adminDemandChart");

    if (!canvas) {
      console.warn("⚠️ Canvas adminDemandChart introuvable");
      return;
    }

    if (typeof Chart === "undefined") {
      console.warn("⚠️ Chart.js non chargé");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (demandChartInstance) {
      demandChartInstance.destroy();
    }

    demandChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "En cours",
          "Terminées",
          "Rejetées"
        ],
        datasets: [
          {
            data: [
              enCoursValue,
              termineesValue,
              rejeteesValue
            ],
            borderWidth: 1
          }
        ]
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
  // DECONNEXION
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