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

  let chartInstance = null;

  // =====================================
  // CHECK SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // SESSION
  // =====================================
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "../auth/login.html";
    return;
  }

  const user = session.user;
  const userId = user.id;

  console.log("✅ USER :", userId);

  // =====================================
  // PROFILE
  // =====================================
  async function loadProfile() {

    const { data } = await supabaseClient
      .from("profiles")
      .select("nom, prenom, phone")
      .eq("id", userId)
      .maybeSingle();

    const fullName = `${data?.nom || ""} ${data?.prenom || ""}`.trim();

    if (welcomeName) welcomeName.textContent = fullName || "Client";
    if (clientNom) clientNom.textContent = data?.nom || "-";
    if (clientEmail) clientEmail.textContent = user.email || "-";
    if (clientPhone) clientPhone.textContent = data?.phone || "-";
  }

  // =====================================
  // DEMANDES
  // =====================================
  async function loadDemandes() {

    const { data } = await supabaseClient
      .from("demandes")
      .select("service, statut, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const demandes = data || [];

    let enCoursCount = 0;
    let termineesCount = 0;
    let rejeteesCount = 0;

    demandes.forEach((item) => {

      const status = String(item.statut || "")
        .toLowerCase();

      if (status.includes("cours")) enCoursCount++;
      else if (status.includes("term")) termineesCount++;
      else if (status.includes("rej")) rejeteesCount++;
    });

    if (totalDemandes) totalDemandes.textContent = demandes.length;
    if (enCours) enCours.textContent = enCoursCount;
    if (terminees) terminees.textContent = termineesCount;
    if (rejetees) rejetees.textContent = rejeteesCount;

    renderTable(demandes);
    renderChart(enCoursCount, termineesCount, rejeteesCount);
  }

  // =====================================
  // TABLE
  // =====================================
  function renderTable(demandes) {

    if (!recentRequestsTable) return;

    if (!demandes.length) {
      recentRequestsTable.innerHTML =
        `<tr><td colspan="3">Aucune demande</td></tr>`;
      return;
    }

    recentRequestsTable.innerHTML = demandes.slice(0, 5).map(d => `
      <tr>
        <td>${d.service || "-"}</td>
        <td>${d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}</td>
        <td>${d.statut || "-"}</td>
      </tr>
    `).join("");
  }

  // =====================================
  // CHART FIX FINAL
  // =====================================
  function renderChart(enCours, terminees, rejetees) {

    const canvas = document.getElementById("demandChart");

    if (!canvas) {
      console.error("❌ Canvas introuvable");
      return;
    }

    if (typeof Chart === "undefined") {
      console.error("❌ Chart.js non chargé");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
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
          legend: { position: "bottom" }
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

  // START
  await loadProfile();
  await loadDemandes();

});