document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // VERIFICATION SUPABASE
  // ===============================
  if (!window.supabaseClient) {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  const db = supabaseClient;

  // ===============================
  // ELEMENTS
  // ===============================
  const idInput = document.getElementById("id");
  const titreInput = document.getElementById("titre");
  const categorieInput = document.getElementById("categorie");
  const contenuInput = document.getElementById("contenu");
  const saveBtn = document.getElementById("saveBtn");
  const list = document.getElementById("list");

  // ===============================
  // RESET FORM
  // ===============================
  function resetForm() {
    idInput.value = "";
    titreInput.value = "";
    categorieInput.value = "";
    contenuInput.value = "";
    saveBtn.textContent = "Publier";
  }

  // ===============================
  // CHARGER ARTICLES
  // ===============================
  async function loadArticles() {

    const { data, error } = await db
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erreur chargement :", error.message);
      return;
    }

    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = "<p>Aucun article trouvé</p>";
      return;
    }

    data.forEach(article => {

      list.innerHTML += `
        <div class="card">
          <h3>${article.titre}</h3>
          <p><strong>${article.categorie}</strong></p>
          <p>${article.contenu}</p>

          <div class="actions">
            <button class="edit" onclick="editArticle('${article.id}')">Modifier</button>
            <button class="delete" onclick="deleteArticle('${article.id}')">Supprimer</button>
          </div>
        </div>
      `;
    });
  }

  // ===============================
  // SAUVEGARDER (CREATE / UPDATE)
  // ===============================
  async function saveArticle() {

    const titre = titreInput.value.trim();
    const categorie = categorieInput.value.trim();
    const contenu = contenuInput.value.trim();

    if (!titre || !categorie || !contenu) {
      alert("❌ Tous les champs sont obligatoires");
      return;
    }

    const data = {
      titre,
      categorie,
      contenu
    };

    let error;

    // UPDATE
    if (idInput.value) {
      ({ error } = await db
        .from("actualites")
        .update(data)
        .eq("id", idInput.value));
    }
    // INSERT
    else {
      ({ error } = await db
        .from("actualites")
        .insert([data]));
    }

    if (error) {
      console.error("❌ Erreur save :", error.message);
      alert("Erreur lors de l'enregistrement");
      return;
    }

    resetForm();
    loadArticles();
  }

  // ===============================
  // EDIT ARTICLE
  // ===============================
  window.editArticle = async (id) => {

    const { data, error } = await db
      .from("actualites")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    idInput.value = data.id;
    titreInput.value = data.titre;
    categorieInput.value = data.categorie;
    contenuInput.value = data.contenu;

    saveBtn.textContent = "Mettre à jour";
  };

  // ===============================
  // DELETE ARTICLE
  // ===============================
  window.deleteArticle = async (id) => {

    if (!confirm("Supprimer cet article ?")) return;

    const { error } = await db
      .from("actualites")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    loadArticles();
  };

  // ===============================
  // EVENTS
  // ===============================
  saveBtn.addEventListener("click", saveArticle);

  // ===============================
  // INIT
  // ===============================
  loadArticles();

});