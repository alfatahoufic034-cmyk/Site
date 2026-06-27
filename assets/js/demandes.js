document.addEventListener("DOMContentLoaded", async () => {

  const demandesTable = document.getElementById("demandesTable");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!demandesTable) {
    console.error("❌ Tableau des demandes introuvable");
    return;
  }

  try {

    // =====================================
    // 🔐 SESSION
    // =====================================
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data?.session) {
      window.location.href = "../auth/login.html";
      return;
    }

    const session = data.session;
    const userId = session.user.id;

    console.log("🟢 SESSION OK :", session.user.email);

    // =====================================
    // 🛡️ ADMIN DETECTION (ROBUSTE)
    // =====================================
    const isAdmin =
      session.user?.app_metadata?.role === "admin" ||
      session.user?.user_metadata?.role === "admin";

    console.log("🛡️ IS ADMIN :", isAdmin);

    // =====================================
    // 🔍 FILTRE TODAY
    // =====================================
    const urlParams = new URLSearchParams(window.location.search);
    const filterToday = urlParams.get("filter") === "today";

    // =====================================
    // 📥 LOAD DEMANDES
    // =====================================
    async function loadDemandes() {

      let query = supabaseClient
        .from("demandes")
        .select("*")
        .order("created_at", { ascending: false });

      // 👉 filtre uniquement USER
      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }

      const { data: demandes, error } = await query;

      if (error) {
        console.error("❌ Supabase error :", error.message);
        demandesTable.innerHTML = `
          <tr><td colspan="5">Erreur chargement données</td></tr>
        `;
        return;
      }

      let result = demandes || [];

      console.log("📦 DEMANDES :", result);

      // =====================================
      // 📅 FILTRE TODAY
      // =====================================
      if (filterToday) {
        const today = new Date();

        result = result.filter((item) => {
          if (!item.created_at) return false;

          const d = new Date(item.created_at);

          return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });
      }

      // =====================================
      // ❌ EMPTY STATE
      // =====================================
      if (result.length === 0) {
        demandesTable.innerHTML = `
          <tr>
            <td colspan="5">Aucune demande trouvée</td>
          </tr>
        `;
        return;
      }

      // =====================================
      // 📊 RENDER TABLE
      // =====================================
      demandesTable.innerHTML = result.map((item) => {

        const localisation =
          item.location ||
          item.localisation ||
          "-";

        return `
          <tr>
            <td>${item.service || "-"}</td>
            <td>${item.description || "-"}</td>
            <td>${localisation}</td>
            <td>${
              item.created_at
                ? new Date(item.created_at).toLocaleDateString("fr-FR")
                : "-"
            }</td>
            <td>${item.statut || "En cours"}</td>
          </tr>
        `;
      }).join("");

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

    // 🚀 START
    await loadDemandes();

  } catch (err) {
    console.error("❌ ERREUR :", err);v

    demandesTable.innerHTML = `
      <tr>
        <td colspan="5">Erreur système</td>
      </tr>
    `;
  }

});