document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const clientsTable = document.getElementById("clientsTable");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  let allClients = [];

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  if (!clientsTable) {
    console.error("❌ clientsTable introuvable");
    return;
  }

  // =====================================
  // VERIFICATION SESSION ADMIN
  // (avec profiles.is_admin)
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

      // Vérification admin via table profiles
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Erreur vérification admin :", profileError.message);
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      if (!profile || profile.is_admin !== true) {
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
  // CHARGER CLIENTS
  // Tous ceux qui ne sont PAS admin
  // =====================================
  async function loadClients() {
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
          id,
          nom,
          prenom,
          phone,
          is_admin,
          created_at
        `)
        .or("is_admin.is.false,is_admin.is.null")
        .order("nom", { ascending: true });

      if (error) throw error;

      allClients = data || [];

      console.log("✅ Clients chargés :", allClients);

      renderClients(allClients);

    } catch (err) {
      console.error("❌ Erreur chargement clients :", err.message);

      clientsTable.innerHTML = `
        <tr>
          <td colspan="6">
            Erreur lors du chargement des clients
          </td>
        </tr>
      `;
    }
  }

  // =====================================
  // AFFICHAGE TABLE
  // =====================================
  function renderClients(clients) {
    if (!clients || !clients.length) {
      clientsTable.innerHTML = `
        <tr>
          <td colspan="6">
            Aucun client trouvé
          </td>
        </tr>
      `;
      return;
    }

    clientsTable.innerHTML = clients.map(client => {
      const fullName =
        `${client.prenom || ""} ${client.nom || ""}`.trim() || "-";

      const createdDate = client.created_at
        ? new Date(client.created_at).toLocaleDateString("fr-FR")
        : "-";

      return `
        <tr>
          <td>${fullName}</td>
          <td>${client.phone || "-"}</td>
          <td>Client</td>
          <td>${createdDate}</td>

          <td>
            <button
              class="view-btn"
              data-id="${client.id}"
            >
              Voir
            </button>
          </td>

          <td>
            <button
              class="delete-btn"
              data-id="${client.id}"
            >
              Supprimer
            </button>
          </td>
        </tr>
      `;
    }).join("");

    attachActions();
  }

  // =====================================
  // ACTIONS
  // =====================================
  function attachActions() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    const viewButtons = document.querySelectorAll(".view-btn");

    // ========= SUPPRESSION =========
    deleteButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const clientId = button.dataset.id;

        if (!clientId) {
          alert("❌ ID client introuvable");
          return;
        }

        const confirmDelete = confirm(
          "Voulez-vous vraiment supprimer ce client ?"
        );

        if (!confirmDelete) return;

        try {
          const { error } = await supabaseClient
            .from("profiles")
            .delete()
            .eq("id", clientId);

          if (error) throw error;

          alert("✅ Client supprimé avec succès");

          await loadClients();

        } catch (err) {
          console.error("❌ Erreur suppression client :", err.message);
          alert("❌ Impossible de supprimer ce client");
        }
      });
    });

    // ========= VOIR =========
    viewButtons.forEach(button => {
      button.addEventListener("click", () => {
        const clientId = button.dataset.id;

        const client = allClients.find(c => c.id === clientId);

        if (!client) {
          alert("Client introuvable");
          return;
        }

        const fullName =
          `${client.prenom || ""} ${client.nom || ""}`.trim();

        alert(
          "Nom : " + (fullName || "-") + "\n" +
          "Téléphone : " + (client.phone || "-") + "\n" +
          "ID : " + (client.id || "-")
        );
      });
    });
  }

  // =====================================
  // RECHERCHE
  // =====================================
  function applySearch() {
    const searchValue = (searchInput?.value || "").toLowerCase();

    if (!searchValue) {
      renderClients(allClients);
      return;
    }

    const filtered = allClients.filter(client => {
      const fullName =
        `${client.prenom || ""} ${client.nom || ""}`.toLowerCase();

      const phone = (client.phone || "").toLowerCase();

      return (
        fullName.includes(searchValue) ||
        phone.includes(searchValue)
      );
    });

    renderClients(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  // =====================================
  // DECONNEXION
  // =====================================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
      } catch (err) {
        console.error("❌ Erreur logout :", err.message);
      }
    });
  }

  // =====================================
  // START
  // =====================================
  const user = await checkAdminSession();

  if (!user) return;

  await loadClients();

});