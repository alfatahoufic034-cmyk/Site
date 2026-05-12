document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("messageBox");

  if (!form || !messageBox) {
    console.error("❌ Formulaire contact introuvable");
    return;
  }

  // =====================================
  // VERIFICATION SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // SUBMIT FORM
  // =====================================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // =====================================
    // RECUPERATION DES VALEURS
    // =====================================
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const messageText = document.getElementById("messageText").value.trim();

    // =====================================
    // VALIDATION
    // =====================================
    if (
      !nom ||
      !prenom ||
      !email ||
      !contact ||
      !messageText
    ) {

      showMessage(
        "Veuillez remplir tous les champs",
        "error"
      );

      return;
    }

    // =====================================
    // BOUTON
    // =====================================
    const submitBtn = form.querySelector(
      "button[type='submit']"
    );

    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    try {

      // =====================================
      // INSERTION SUPABASE
      // =====================================
      const { error } = await supabaseClient
        .from("contacts")
        .insert([
          {
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: contact,
            message: messageText
          }
        ]);

      // =====================================
      // ERREUR SQL
      // =====================================
      if (error) {
        throw error;
      }

      // =====================================
      // SUCCES
      // =====================================
      showMessage(
        "✅ Message envoyé avec succès",
        "success"
      );

      console.log("✅ Contact enregistré");

      // RESET
      form.reset();

    } catch (err) {

      console.error(
        "❌ Erreur envoi contact :",
        err.message
      );

      showMessage(
        "❌ Impossible d'envoyer le message",
        "error"
      );

    } finally {

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

    }

  });

  // =====================================
  // MESSAGE UI
  // =====================================
  function showMessage(text, type) {

    messageBox.textContent = text;

    messageBox.className = "message";

    if (type === "success") {
      messageBox.classList.add("success");
    }

    if (type === "error") {
      messageBox.classList.add("error");
    }

    setTimeout(() => {

      messageBox.textContent = "";
      messageBox.className = "message";

    }, 5000);

  }

});