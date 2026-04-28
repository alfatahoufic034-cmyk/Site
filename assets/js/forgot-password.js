document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // ELEMENTS
  // ========================================

  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("email");
  const message = document.getElementById("message");

  // ========================================
  // VERIFICATION SUPABASE
  // ========================================

  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");

    if (message) {
      message.textContent = "Erreur : connexion Supabase introuvable.";
      message.style.color = "red";
    }

    return;
  }

  console.log("✅ forgot-password.js chargé");

  // ========================================
  // ENVOI EMAIL RESET PASSWORD
  // ========================================

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      message.textContent = "Veuillez entrer votre adresse email.";
      message.style.color = "red";
      return;
    }

    try {
      // message chargement
      message.textContent = "⏳ Envoi du lien en cours...";
      message.style.color = "#d4af37";

      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://127.0.0.1:5500/auth/reset-password.html"
        }
      );

      if (error) {
        throw error;
      }

      // succès
      message.textContent =
        "✅ Un lien de réinitialisation a été envoyé à votre email.";
      message.style.color = "green";

      form.reset();

      console.log("✅ Email de réinitialisation envoyé");

    } catch (err) {
      console.error("❌ Erreur reset password :", err.message);

      message.textContent =
        "❌ " + err.message;
      message.style.color = "red";
    }
  });
});