document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const avisTable = document.getElementById("adminAvisTable");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  let allAvis = [];

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // VERIFICATION SESSION ADMIN
  // (CORRIGÉ avec profiles.is_admin)
  // =====================================
  async function checkAdminSession() {
    try {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      if (error || !session) {
        window.location.href = "../auth/login.html";
        return null;
      }

      const user = session.user;

      // Vérification dans profiles
      const {
        data: profile,
        error: profileError
      } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.is_admin !== true
      ) {
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      return user;

    } catch (err) {
      console.error("❌ Erreur session admin :", err.message);
      window.location.href = "../auth/login.html";
      return null;
    }
  }

  // =====================================
  // CHARGER AVIS
  // =====================================
  async function loadAvis() {
    try {
      if (!avisTable) return;

      avisTable.innerHTML = `
        <tr>
          <td colspan="6">Chargement des avis...</td>
        </tr>
      `;

      const {
        data,
        error
      } = await supabaseClient
        .from("avis")
        .select("*")
        .order("created_at", {
          ascending: false
        });

      if (error) throw error;

      allAvis = data || [];
      renderAvis(allAvis);

    } catch (err) {
      console.error("❌ Erreur chargement avis :", err.message);

      if (avisTable) {
        avisTable.innerHTML = `
          <tr>
            <td colspan="6">
              Erreur lors du chargement des avis
            </td>
          </tr>
        `;
      }
    }
  }

  // =====================================
  // AFFICHAGE TABLE
  // =====================================
  function renderAvis(list) {
    if (!avisTable) return;

    if (!list.length) {
      avisTable.innerHTML = `
        <tr>
          <td colspan="6">
            Aucun avis trouvé
          </td>
        </tr>
      `;
      return;
    }

    avisTable.innerHTML = list.map(item => `
      <tr>
        <td>${item.nom || "Client"}</td>
        <td>${item.email || "-"}</td>
        <td>${renderStars(item.note)}</td>
        <td>${item.message || "-"}</td>
        <td>
          ${
            item.created_at
              ? new Date(item.created_at).toLocaleDateString("fr-FR")
              : "-"
          }
        </td>
        <td>
          <button
            class="delete-btn"
            data-id="${item.id}"
          >
            Supprimer
          </button>
        </td>
      </tr>
    `).join("");

    attachDeleteEvents();
  }

  // =====================================
  // AFFICHAGE ETOILES
  // =====================================
  function renderStars(note) {
    const rating = parseInt(note) || 0;

    let stars = "";

    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? "★" : "☆";
    }

    return stars;
  }

  // =====================================
  // SUPPRESSION AVIS
  // =====================================
  function attachDeleteEvents() {
    const buttons = document.querySelectorAll(".delete-btn");

    buttons.forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;

        if (!id) return;

        const confirmDelete = confirm(
          "Voulez-vous vraiment supprimer cet avis ?"
        );

        if (!confirmDelete) return;

        try {
          const { error } = await supabaseClient
            .from("avis")
            .delete()
            .eq("id", id);

          if (error) throw error;

          await loadAvis();

        } catch (err) {
          console.error("❌ Erreur suppression :", err.message);
          alert("Erreur lors de la suppression");
        }
      });
    });
  }

  // =====================================
  // RECHERCHE
  // =====================================
  function applySearch() {
    const value = (searchInput?.value || "").toLowerCase();

    if (!value) {
      renderAvis(allAvis);
      return;
    }

    const filtered = allAvis.filter(item =>
      (item.nom || "")
        .toLowerCase()
        .includes(value) ||

      (item.email || "")
        .toLowerCase()
        .includes(value) ||

      (item.message || "")
        .toLowerCase()
        .includes(value)
    );

    renderAvis(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
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

  // =====================================
  // START
  // =====================================
  const user = await checkAdminSession();

  if (!user) return;

  await loadAvis();

});