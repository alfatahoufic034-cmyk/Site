document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const contactsTable =
    document.getElementById("contactsTable");

  const logoutBtn =
    document.getElementById("logoutBtn");

  // =====================================
  // SECURITE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ Supabase introuvable");
    return;
  }

  // =====================================
  // SESSION ADMIN
  // =====================================
  async function checkAdmin() {

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
      window.location.href =
        "../auth/login.html";
      return null;
    }

    const user = session.user;

    const { data: profile } =
      await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile || profile.is_admin !== true) {

      await supabaseClient.auth.signOut();

      window.location.href =
        "../auth/login.html";

      return null;
    }

    return user;
  }

  // =====================================
  // CHARGER CONTACTS
  // =====================================
  async function loadContacts() {

    try {

      const { data, error } =
        await supabaseClient
          .from("contacts")
          .select("*")
          .order("created_at", {
            ascending: false
          });

      if (error) {
        throw error;
      }

      const contacts = data || [];

      // =====================================
      // AUCUN MESSAGE
      // =====================================
      if (!contacts.length) {

        contactsTable.innerHTML = `
          <tr>
            <td colspan="5">
              Aucun message trouvé
            </td>
          </tr>
        `;

        return;
      }

      // =====================================
      // AFFICHAGE
      // =====================================
      contactsTable.innerHTML =
        contacts.map((item) => `

          <tr>

            <td>
              ${item.nom || "-"} 
              ${item.prenom || ""}
            </td>

            <td>
              ${item.email || "-"}
            </td>

            <td>
              ${item.telephone || "-"}
            </td>

            <td>
              ${item.message || "-"}
            </td>

            <td>
              ${
                item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleDateString("fr-FR")
                  : "-"
              }
            </td>

          </tr>

        `).join("");

    } catch (err) {

      console.error(
        "❌ Erreur chargement contacts :",
        err.message
      );

      contactsTable.innerHTML = `
        <tr>
          <td colspan="5">
            Erreur chargement messages
          </td>
        </tr>
      `;
    }
  }

  // =====================================
  // LOGOUT
  // =====================================
  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async (e) => {

        e.preventDefault();

        await supabaseClient.auth.signOut();

        window.location.href =
          "../auth/login.html";
      }
    );
  }

  // =====================================
  // START
  // =====================================
  const user = await checkAdmin();

  if (!user) return;

  await loadContacts();

});