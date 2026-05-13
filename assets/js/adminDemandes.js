document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const demandesTable = document.getElementById("adminDemandesTable");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  let allDemandes = [];


      // =====================================
  // EMAILJS INIT
  // =====================================
  emailjs.init("KusED4VK8YahzB6qu");

  if (typeof emailjs === "undefined") {
    console.error("❌ EmailJS non chargé");
    return;
  }

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  if (!demandesTable) {
    console.error("❌ adminDemandesTable introuvable");
    return;
  }

  // =====================================
  // SESSION ADMIN
  // =====================================
  async function checkAdminSession() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error || !session) {
        window.location.href = "../auth/login.html";
        return null;
      }

      const user = session.user;

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      return user;

    } catch (err) {
      console.error("❌ session error :", err.message);
      window.location.href = "../auth/login.html";
      return null;
    }
  }

  // =====================================
  // NORMALISATION STATUT (ROBUSTE)
  // =====================================
  function normalizeStatus(status) {
    const value = (status || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (value.includes("cours")) return "en_cours";
    if (value.includes("term")) return "terminee";
    if (value.includes("rej")) return "rejetee";

    return "en_cours";
  }

  // =====================================
  // CHARGER DEMANDES
  // =====================================
  async function loadDemandes() {
    try {
      const { data, error } = await supabaseClient
        .from("demandes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      allDemandes = data || [];
      renderDemandes(allDemandes);

    } catch (err) {
      console.error("❌ load error :", err.message);

      demandesTable.innerHTML = `
        <tr>
          <td colspan="9">Erreur lors du chargement</td>
        </tr>
      `;
    }
  }

  // =====================================
  // AFFICHAGE TABLE
  // =====================================
  function renderDemandes(demandes) {

    if (!demandes || demandes.length === 0) {
      demandesTable.innerHTML = `
        <tr>
          <td colspan="9">Aucune demande trouvée</td>
        </tr>
      `;
      return;
    }

    demandesTable.innerHTML = demandes.map(item => `
      <tr>
        <td>${item.nom_complet || "-"}</td>
        <td>${item.email || "-"}</td>
        <td>${item.telephone || "-"}</td>
        <td>${item.service || "-"}</td>
        <td>${item.description || "-"}</td>
        <td>${item.localisation || "-"}</td>
        <td>
          ${item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "-"}
        </td>

        <td>
          <select class="status-select" data-id="${item.id}">
            <option value="en_cours" ${normalizeStatus(item.statut) === "en_cours" ? "selected" : ""}>En cours</option>
            <option value="terminee" ${normalizeStatus(item.statut) === "terminee" ? "selected" : ""}>Terminée</option>
            <option value="rejetee" ${normalizeStatus(item.statut) === "rejetee" ? "selected" : ""}>Rejetée</option>
          </select>
        </td>

        <td class="actions-cell">

  <button class="update-btn" data-id="${item.id}">
    Mettre à jour
  </button>

  <button
    class="sendMailBtn"
    data-email="${item.email || ""}"
    data-name="${item.nom_complet || "Client"}"
    data-service="${item.service || "Service"}"
  >
    Envoyer Email
  </button>

</td>
      </tr>
    `).join("");

    attachUpdateEvents();
    attachEmailEvents();
  }

  // =====================================
  // UPDATE STATUT (FIX FINAL IMPORTANT)
  // =====================================
  function attachUpdateEvents() {

    document.querySelectorAll(".update-btn").forEach(btn => {

      btn.onclick = async () => {

        const id = btn.dataset.id;
        const select = document.querySelector(`.status-select[data-id="${id}"]`);

        if (!id || !select) {
          alert("❌ Données invalides");
          return;
        }

        const newStatus = select.value;

        try {

          console.log("UPDATE :", id, newStatus);

          const { error } = await supabaseClient
            .from("demandes")
            .update({
              statut: newStatus
            })
            .eq("id", id);

          if (error) throw error;

          alert("✅ Statut mis à jour");

          await loadDemandes();

        } catch (err) {
          console.error("❌ UPDATE ERROR FULL :", err);
          alert(err.message || "Erreur mise à jour");
        }
      };
    });
  }

  // =====================================
  // FILTRES
  // =====================================
  function applyFilters() {

    const selectedStatus = statusFilter?.value || "";
    const searchValue = (searchInput?.value || "").toLowerCase();

    let filtered = [...allDemandes];

    if (selectedStatus) {
      filtered = filtered.filter(item =>
        normalizeStatus(item.statut) === selectedStatus
      );
    }

    if (searchValue) {
      filtered = filtered.filter(item =>
        (item.nom_complet || "").toLowerCase().includes(searchValue) ||
        (item.email || "").toLowerCase().includes(searchValue) ||
        (item.service || "").toLowerCase().includes(searchValue)
      );
    }

    renderDemandes(filtered);
  }

  statusFilter?.addEventListener("change", applyFilters);
  searchInput?.addEventListener("input", applyFilters);


  // =====================================
  // ENVOI EMAIL CLIENT
  // =====================================
  function attachEmailEvents() {

    document.querySelectorAll(".sendMailBtn").forEach((btn) => {

      btn.onclick = async () => {

        const email = btn.dataset.email;
        const name = btn.dataset.name;
        const service = btn.dataset.service;

        if (!email) {
          alert("❌ Email client introuvable");
          return;
        }

        const originalText = btn.textContent;

        btn.disabled = true;
        btn.textContent = "Envoi...";

        try {

          await emailjs.send(
            "service_hskelrg",
            "template_cfq2vth",
            {
              name: name,
              email: email,
              service: service,
              date: new Date().toLocaleDateString("fr-FR")
            }
          );

          alert("✅ Email envoyé avec succès");

          btn.textContent = "Email envoyé";

        } catch (err) {

          console.error("❌ EMAIL ERROR :", err);

          alert("❌ Impossible d'envoyer l'email");

          btn.disabled = false;
          btn.textContent = originalText;
        }

      };

    });

  }

  // =====================================
  // LOGOUT
  // =====================================
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    window.location.href = "../auth/login.html";
  });

  // =====================================
  // START
  // =====================================
  const user = await checkAdminSession();
  if (!user) return;

  await loadDemandes();
});