document.addEventListener("DOMContentLoaded", async () => {

  const welcomeName = document.getElementById("welcomeName");
  const totalDemandes = document.getElementById("totalDemandes");
  const enCours = document.getElementById("enCours");
  const terminees = document.getElementById("terminees");
  const rejetees = document.getElementById("rejetees");

  const clientNom = document.getElementById("clientNom");
  const clientEmail = document.getElementById("clientEmail");
  const clientPhone = document.getElementById("clientPhone");

  const recentRequestsTable = document.getElementById("recentRequestsTable");
  const logoutBtn = document.getElementById("logoutBtn");

  let demandChartInstance = null;

  try {

    // =====================================
    // 🔐 SESSION
    // =====================================
    const { data: { session }, error } =
      await supabaseClient.auth.getSession();

    if (error || !session) {
      window.location.href = "../auth/login.html";
      return;
    }

    const user = session.user;
    const userId = user.id;

    const userEmail = (user.email || "").trim().toLowerCase();

    console.log("✅ USER CONNECTÉ :", userId);

    // =====================================
    // 👤 PROFIL
    // =====================================
    async function loadProfile() {

      const { data, error } = await supabaseClient
        .from("profiles")
        .select("nom, prenom, phone")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error(error.message);
        return;
      }

      const fullName =
        `${data?.nom || ""} ${data?.prenom || ""}`.trim() || "Client";

      if (welcomeName) welcomeName.textContent = fullName;
      if (clientNom) clientNom.textContent = fullName;
      if (clientEmail) clientEmail.textContent = userEmail || "-";
      if (clientPhone) clientPhone.textContent = data?.phone || "-";
    }

    // =====================================
    // 📥 DEMANDES (FIX USER_ID ICI)
    // =====================================
    async function loadDemandes() {

      const { data, error } = await supabaseClient
        .from("demandes")
        .select("service, statut, created_at, user_id")
        .eq("user_id", userId) // 🔥 IMPORTANT
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ SUPABASE ERROR:", error.message);
        return;
      }

      const demandes = data || [];

      console.log("📦 DEMANDES :", demandes);

      let enCoursCount = 0;
      let termineesCount = 0;
      let rejeteesCount = 0;

      demandes.forEach((item) => {

        const status = (item.statut || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (status.includes("en cours") || status.includes("encours")) {
          enCoursCount++;
        }

        if (status.includes("termine")) {
          termineesCount++;
        }

        if (status.includes("rejete")) {
          rejeteesCount++;
        }
      });

      if (totalDemandes) totalDemandes.textContent = demandes.length;
      if (enCours) enCours.textContent = enCoursCount;
      if (terminees) terminees.textContent = termineesCount;
      if (rejetees) rejetees.textContent = rejeteesCount;

      renderRecentRequests(demandes);
      renderChart(enCoursCount, termineesCount, rejeteesCount);
    }

    // =====================================
    // 📋 TABLE
    // =====================================
    function renderRecentRequests(demandes) {

      if (!recentRequestsTable) return;

      if (!demandes.length) {
        recentRequestsTable.innerHTML = `
          <tr><td colspan="3">Aucune demande trouvée</td></tr>
        `;
        return;
      }

      recentRequestsTable.innerHTML = demandes.slice(0, 5).map((item) => `
        <tr>
          <td>${item.service || "-"}</td>
          <td>${
            item.created_at
              ? new Date(item.created_at).toLocaleDateString("fr-FR")
              : "-"
          }</td>
          <td>${item.statut || "-"}</td>
        </tr>
      `).join("");
    }

    // =====================================
    // 📊 CHART
    // =====================================
    function renderChart(enCours, termine, rejete) {

      const canvas = document.getElementById("demandChart");
      if (!canvas || typeof Chart === "undefined") return;

      const ctx = canvas.getContext("2d");

      if (demandChartInstance) {
        demandChartInstance.destroy();
      }

      demandChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["En cours", "Terminées", "Rejetées"],
          datasets: [{
            data: [enCours, termine, rejete],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }

    // =====================================
    // 🔓 LOGOUT
    // =====================================
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
      });
    }

    await loadProfile();
    await loadDemandes();

  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err.message);
  }

});