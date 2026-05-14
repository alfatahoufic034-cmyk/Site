document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("serviceForm");
  const messageBox = document.getElementById("successMessage");

  if (!form || !messageBox) {
    console.error("❌ Formulaire introuvable");
    return;
  }

  // =====================================
  // ANTI DOUBLE SUBMIT
  // =====================================
  let isSubmitting = false;

  // =====================================
  // SUBMIT FORM
  // =====================================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // 🔥 BLOQUE DOUBLE CLIC
    if (isSubmitting) return;
    isSubmitting = true;

    // =====================================
    // CHAMPS FORMULAIRE
    // =====================================
    const nomComplet = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const telephone = document.getElementById("phone")?.value.trim();
    const service = document.getElementById("service")?.value;
    const description = document.getElementById("description")?.value.trim();
    const localisation = document.getElementById("location")?.value.trim();

    // =====================================
    // VALIDATION
    // =====================================
    if (!nomComplet || !email || !telephone || !service || !description) {
      messageBox.textContent = "❌ Veuillez remplir tous les champs obligatoires.";
      messageBox.style.color = "red";
      isSubmitting = false;
      return;
    }

    try {

      // =====================================
      // UTILISATEUR CONNECTÉ
      // =====================================
      const { data, error: userError } =
        await supabaseClient.auth.getUser();

      const user = data?.user;

      if (userError || !user) {
        throw new Error("Vous devez être connecté pour envoyer une demande.");
      }

      // =====================================
      // CHARGEMENT
      // =====================================
      messageBox.textContent = "⏳ Envoi de votre demande...";
      messageBox.style.color = "#FFD700";

      // =====================================
      // INSERT SUPABASE
      // =====================================
      const { error } = await supabaseClient
        .from("demandes")
        .insert([{
          user_id: user.id,
          nom_complet: nomComplet,
          email: email,
          telephone: telephone,
          service: service,
          description: description,
          localisation: localisation || null,
          statut: "en_cours"
        }]);

      if (error) throw error;

      // =====================================
      // EMAILJS (OPTIONNEL SAFE)
      // =====================================
      if (typeof emailjs !== "undefined") {

        try {
          await emailjs.send(
            "service_hskelrg",
            "template_qshwyx8",
            {
              nom_complet: nomComplet,
              email: email,
              telephone: telephone,
              service: service,
              description: description,
              localisation: localisation || "Non renseignée",
              type_notification: "Nouvelle demande de service - ALFA IT SERVICE"
            },
            "KusED4Vk8YahzB8qu"
          );
        } catch (emailErr) {
          console.warn("⚠️ EmailJS erreur :", emailErr);
        }

      } else {
        console.warn("⚠️ EmailJS non chargé");
      }

      // =====================================
      // SUCCÈS
      // =====================================
      messageBox.textContent =
        "✅ ALFA IT SERVICE : Votre demande a été envoyée avec succès !";

      messageBox.style.color = "green";

      form.reset();

      setTimeout(() => {
        window.location.href = "client/dashboard.html";
      }, 2000);

    } catch (err) {

      console.error("❌ Erreur demande :", err);

      const message =
        err?.message ||
        err?.error?.message ||
        "Erreur inconnue";

      messageBox.textContent = "❌ " + message;
      messageBox.style.color = "red";

    } finally {
      isSubmitting = false;
    }

  });

});