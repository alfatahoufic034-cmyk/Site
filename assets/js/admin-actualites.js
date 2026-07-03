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
  // QUILL EDITOR
  // ===============================
  const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        ["blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"]
      ]
    }
  });

  // ===============================
  // ELEMENTS
  // ===============================
  const idInput = document.getElementById("id");
  const titreInput = document.getElementById("titre");
  const categorieInput = document.getElementById("categorie");

  const imageInput =
    document.getElementById("image");

  const previewImage =
    document.getElementById("previewImage");

  const preview =
    document.querySelector(".preview");

  const saveBtn =
    document.getElementById("saveBtn");

  const list =
    document.getElementById("list");

  // ===============================
  // RESET
  // ===============================
  function resetForm() {

    idInput.value = "";

    titreInput.value = "";

    categorieInput.value = "";

    imageInput.value = "";

    quill.root.innerHTML = "";

    preview.style.display = "none";

    saveBtn.textContent =
      "Publier";
  }

  // ===============================
  // UPLOAD IMAGE
  // ===============================
  async function uploadImage() {

    if (!imageInput.files[0]) {
      return null;
    }

    const file =
      imageInput.files[0];

    const fileName =
      Date.now() +
      "-" +
      file.name;

    const {
      error
    }
    =
    await db.storage
      .from("actualites")
      .upload(
        fileName,
        file
      );

    if (error) {

      alert(
        "Erreur upload image"
      );

      return null;
    }

    const {
      data
    }
    =
    db.storage
      .from("actualites")
      .getPublicUrl(
        fileName
      );

    return data.publicUrl;
  }

  // ===============================
  // LOAD ARTICLES
  // ===============================
  async function loadArticles() {

    const {
      data,
      error
    }
    =
    await db
      .from("actualites")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );

    if (error) {

      console.error(
        error.message
      );

      return;
    }

    list.innerHTML = "";

    if (!data.length) {

      list.innerHTML =
        "<p>Aucun article trouvé</p>";

      return;
    }

    data.forEach(article => {

      list.innerHTML += `

<div class="card">

${
article.image_url
?
`
<img
src="${article.image_url}"
style="
width:100%;
height:240px;
object-fit:cover;
border-radius:10px;
margin-bottom:15px;
">
`
:
""
}

<h3>
${article.titre||""}
</h3>

<p>
<strong>
${article.categorie||""}
</strong>
</p>

<div>

${article.contenu||""}

</div>

<div class="actions">

<button
class="edit"
onclick="editArticle('${article.id}')">

Modifier

</button>

<button
class="delete"
onclick="deleteArticle('${article.id}')">

Supprimer

</button>

</div>

</div>

`;

    });

  }

  // ===============================
  // SAVE
  // ===============================
 if (
  error
) {

  console.error(
    error.message
  );

  alert(
    "❌ Erreur lors de l'enregistrement"
  );

  return;
}

if (
  idInput.value
) {

  alert(
    "✅ Article modifié avec succès"
  );

}

else {

  alert(
    "✅ Article publié avec succès"
  );

}

resetForm();

loadArticles();

  // ===============================
  // EDIT
  // ===============================
  window.editArticle =
  async (
    id
  ) => {

    const {
      data
    }
    =
    await db
      .from(
        "actualites"
      )
      .select("*")
      .eq(
        "id",
        id
      )
      .single();

    if (
      !data
    ) return;

    idInput.value =
      data.id;

    titreInput.value =
      data.titre;

    categorieInput.value =
      data.categorie;

    quill.root.innerHTML =
      data.contenu || "";

    if (
      data.image_url
    ) {

      previewImage.src =
        data.image_url;

      preview.style.display =
        "block";

    }

    saveBtn.textContent =
      "Mettre à jour";

  };

  // ===============================
  // DELETE
  // ===============================
  window.deleteArticle =
async (
id
) => {

if (
!confirm(
"⚠️ Voulez-vous vraiment supprimer cet article ?"
)
)
return;

const {
error
}
=
await db
.from(
"actualites"
)
.delete()
.eq(
"id",
id
);

if (
error
) {

alert(
"❌ Erreur lors de la suppression"
);

return;

}

alert(
"✅ Article supprimé avec succès"
);

loadArticles();

};

  // ===============================
  // EVENTS
  // ===============================
  saveBtn.addEventListener(
    "click",
    saveArticle
  );

  // ===============================
  // START
  // ===============================
  loadArticles();

});