document.addEventListener("DOMContentLoaded", async () => {

  const historiqueTable = document.getElementById("historiqueTable");
  const totalHistorique = document.getElementById("totalHistorique");
  const totalTerminees = document.getElementById("totalTerminees");
  const totalRejetees = document.getElementById("totalRejetees");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!historiqueTable) {
    console.error("❌ Tableau historique introuvable");
    return;
  }

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

    const userId = session.user.id;

    console.log("✅ USER ID :", userId);

    // =====================================
    // 📥 HISTORIQUE
    // =====================================
    async function loadHistorique() {

      const { data, error } = await supabaseClient
        .from("demandes")
        .select("service, statut, created_at")
        .eq("user_id", userId) // 🔥 correct
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error :", error.message);
        return;
      }

      const historiques = data || [];

      console.log("📦 HISTORIQUE :", historiques);

      let total = historiques.length;
      let terminees = 0;
      let rejetees = 0;

      if (!historiques.length) {
        historiqueTable.innerHTML = `
          <tr>
            <td colspan="3">Aucun historique disponible</td>
          </tr>
        `;

        totalHistorique.textContent = "0";
        totalTerminees.textContent = "0";
        totalRejetees.textContent = "0";
        return;
      }

      // =====================================
      // 📊 FILTRAGE PROPRE
      // =====================================
      historiques.forEach(item => {

        const statut = (item.statut || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (statut.includes("termine")) terminees++;
        if (statut.includes("rejete")) rejetees++;
      });

      totalHistorique.textContent = total;
      totalTerminees.textContent = terminees;
      totalRejetees.textContent = rejetees;

      // =====================================
      // 📋 TABLE
      // =====================================
      historiqueTable.innerHTML = historiques.map(item => `
        <tr>
          <td>${item.service || "-"}</td>
          <td>${item.statut || "-"}</td>
          <td>${
            item.created_at
              ? new Date(item.created_at).toLocaleDateString("fr-FR")
              : "-"
          }</td>
        </tr>
      `).join("");
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

    // =====================================
    // 🚀 START
    // =====================================
    await loadHistorique();

  } catch (err) {
    console.error("❌ HISTORIQUE ERROR :", err.message);
  }

});