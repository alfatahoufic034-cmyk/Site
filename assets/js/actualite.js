document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("newsContainer");

  if (!container) {
    console.error("❌ newsContainer introuvable");
    return;
  }

  if (!window.supabaseClient) {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  async function loadActualites() {
    const { data, error } = await supabaseClient
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ erreur chargement :", error.message);
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Aucune actualité disponible</p>";
      return;
    }

    container.innerHTML = data.map(item => `
      <div class="news-card reveal">
        <div class="news-content">

          <span class="date">
            ${new Date(item.created_at).toLocaleDateString("fr-FR")}
          </span>

          <h3>${item.titre || "Sans titre"}</h3>

          <p>${item.contenu || ""}</p>

        </div>
      </div>
    `).join("");
  }

  await loadActualites();

});