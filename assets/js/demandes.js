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
    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
      window.location.href = "../auth/login.html";
      return;
    }

    const userId = session.user.id;
    console.log("✅ USER ID :", userId);

    // =====================================
    // 🔍 VERIFIER SI FILTRE TODAY
    // =====================================
    const urlParams = new URLSearchParams(window.location.search);
    const filterToday = urlParams.get("filter") === "today";

    console.log("📌 Filtre Today :", filterToday);

    // =====================================
    // 📥 DEMANDES
    // =====================================
    async function loadDemandes() {

      const { data, error } = await supabaseClient
        .from("demandes")
        .select(`
          service,
          description,
          location,
          statut,
          created_at,
          localisation
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error :", error.message);
        return;
      }

      let demandes = data || [];

      console.log("📦 DEMANDES :", demandes);

      // =====================================
      // 📅 FILTRE DEMANDES DU JOUR
      // =====================================
      if (filterToday) {
        const today = new Date();

        demandes = demandes.filter((item) => {
          if (!item.created_at) return false;

          const createdDate = new Date(item.created_at);

          return (
            createdDate.getDate() === today.getDate() &&
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getFullYear() === today.getFullYear()
          );
        });

        console.log("🔥 Demandes du jour :", demandes);
      }

      // =====================================
      // AUCUNE DEMANDE
      // =====================================
      if (!demandes.length) {
        demandesTable.innerHTML = `
          <tr>
            <td colspan="5">
              ${
                filterToday
                  ? "Aucune nouvelle demande aujourd’hui"
                  : "Aucune demande trouvée"
              }
            </td>
          </tr>
        `;
        return;
      }

      // =====================================
      // AFFICHAGE TABLEAU
      // =====================================
      demandesTable.innerHTML = demandes.map((item) => {

        // 🔥 FIX IMPORTANT
        const localisation =
          item.location ||
          item.localisation ||
          "-";

        return `
          <tr>
            <td>${item.service || "-"}</td>
            <td>${item.description || "-"}</td>
            <td>${localisation}</td>
            <td>
              ${
                item.created_at
                  ? new Date(item.created_at).toLocaleDateString("fr-FR")
                  : "-"
              }
            </td>
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

        try {
          await supabaseClient.auth.signOut();
          window.location.href = "../auth/login.html";
        } catch (err) {
          console.error("❌ Logout error :", err.message);
        }
      });
    }

    // =====================================
    // 🚀 START
    // =====================================
    await loadDemandes();

  } catch (err) {
    console.error("❌ ERREUR GÉNÉRALE :", err);

    demandesTable.innerHTML = `
      <tr>
        <td colspan="5">
          Erreur système
        </td>
      </tr>
    `;
  }

});