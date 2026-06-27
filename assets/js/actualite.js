document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("newsContainer");

  if (!container) return;
  if (!window.supabaseClient) return;

  async function loadActualites() {

    const { data, error } = await supabaseClient
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Aucune actualité disponible</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach((item, index) => {

      const fullHTML = item.contenu || "";

      const temp = document.createElement("div");
      temp.innerHTML = fullHTML;

      const isLong = temp.innerText.length > 300;

      const shortHTML = isLong
        ? fullHTML.slice(0, 300) + "..."
        : fullHTML;

      const card = document.createElement("div");
      card.className = "news-card";

      card.innerHTML = `
        ${item.image_url ? `
          <div class="news-image">
            <img src="${item.image_url}" alt="">
          </div>
        ` : ""}

        <div class="news-content">

          <span class="date">
            ${new Date(item.created_at).toLocaleDateString("fr-FR")}
          </span>

          <h3>${item.titre || ""}</h3>

          <div class="article-text">
            ${isLong ? shortHTML : fullHTML}
          </div>

          ${isLong ? `<button class="read-more">Voir plus</button>` : ""}

        </div>
      `;

      container.appendChild(card);

      // =========================
      // EVENT BUTTON
      // =========================
      const btn = card.querySelector(".read-more");

      if (btn) {

        let open = false;

        btn.addEventListener("click", () => {

          const textDiv = card.querySelector(".article-text");

          if (!open) {
            textDiv.innerHTML = fullHTML;
            btn.textContent = "Réduire";
            open = true;
          } else {
            textDiv.innerHTML = shortHTML;
            btn.textContent = "Voir plus";
            open = false;
          }
        });
      }
    });
  }

  await loadActualites();
});