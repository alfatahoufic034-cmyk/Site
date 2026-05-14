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
  // SUBMIT FORM
  // =====================================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // =====================================
    // CHAMPS FORMULAIRE
    // =====================================
    const nomComplet =
      document.getElementById("name")?.value.trim();

    const email =
      document.getElementById("email")?.value.trim();

    const telephone =
      document.getElementById("phone")?.value.trim();

    const service =
      document.getElementById("service")?.value;

    const description =
      document.getElementById("description")?.value.trim();

    const localisation =
      document.getElementById("location")?.value.trim();

    // =====================================
    // VALIDATIONS
    // =====================================
    if (
      !nomComplet ||
      !email ||
      !telephone ||
      !service ||
      !description
    ) {

      messageBox.textContent =
        "❌ Veuillez remplir tous les champs obligatoires.";

      messageBox.style.color = "red";

      return;
    }

    // =====================================
    // UTILISATEUR CONNECTÉ
    // =====================================
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

      messageBox.textContent =
        "❌ Vous devez être connecté pour envoyer une demande.";

      messageBox.style.color = "red";

      return;
    }

    // =====================================
    // MESSAGE CHARGEMENT
    // =====================================
    messageBox.textContent =
      "⏳ Envoi de votre demande...";

    messageBox.style.color = "#FFD700";

    try {

      // =====================================
      // INSERTION SUPABASE
      // =====================================
      const { error } = await supabaseClient
        .from("demandes")
        .insert([
          {
            user_id: user.id,
            nom_complet: nomComplet,
            email: email,
            telephone: telephone,
            service: service,
            description: description,
            localisation: localisation || null,
            statut: "en_cours"
          }
        ]);

      // =====================================
      // ERREUR INSERTION
      // =====================================
      if (error) {
        throw error;
      }

      // =====================================
      // EMAILJS NOTIFICATION ADMIN
      // =====================================
      await emailjs.send(
        "service_hskelrg",
        "template_qshwyx8",
        {
          nom_complet: nomComplet,
          email: email,
          telephone: telephone,
          service: service,
          description: description,
          localisation:
            localisation || "Non renseignée",

          type_notification:
            "Nouvelle demande de service"
        }
      );

      // =====================================
      // SUCCÈS
      // =====================================
      messageBox.textContent =
        "✅ Votre demande a été envoyée avec succès !";

      messageBox.style.color = "green";

      // Reset formulaire
      form.reset();

      // =====================================
      // REDIRECTION
      // =====================================
      setTimeout(() => {

        // IMPORTANT :
        // dashboard client est dans /client/
        window.location.href =
          "client/dashboard.html";

      }, 2000);

    } catch (err) {

      console.error(
        "❌ Erreur demande :",
        err
      );

      messageBox.textContent =
        "❌ Erreur lors de l’envoi : " +
        (err.message || "Erreur inconnue");

      messageBox.style.color = "red";
    }

  });

});