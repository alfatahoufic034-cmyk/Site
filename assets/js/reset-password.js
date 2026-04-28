document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // ELEMENTS
  // =============================
  const form = document.getElementById("resetPasswordForm");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const message = document.getElementById("message");

  // =============================
  // VERIFICATION SUPABASE
  // =============================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    if (message) {
      message.textContent = "Erreur de configuration Supabase";
      message.style.color = "red";
    }
    return;
  }

  console.log("✅ reset-password.js chargé");

  // =============================
  // RESET PASSWORD
  // =============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pass1 = newPassword.value.trim();
    const pass2 = confirmPassword.value.trim();

    // validation
    if (!pass1 || !pass2) {
      message.textContent = "Veuillez remplir tous les champs";
      message.style.color = "red";
      return;
    }

    if (pass1.length < 6) {
      message.textContent = "Le mot de passe doit contenir au moins 6 caractères";
      message.style.color = "red";
      return;
    }

    if (pass1 !== pass2) {
      message.textContent = "Les mots de passe ne correspondent pas";
      message.style.color = "red";
      return;
    }

    try {
      message.textContent = "⏳ Mise à jour du mot de passe...";
      message.style.color = "#d4af37";

      // UPDATE PASSWORD via Supabase
      const { error } = await supabaseClient.auth.updateUser({
        password: pass1
      });

      if (error) {
        throw error;
      }

      message.textContent = "✅ Mot de passe mis à jour avec succès";
      message.style.color = "green";

      // reset form
      form.reset();

      // redirection login après 2 secondes
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } catch (err) {
      console.error("❌ erreur reset password :", err.message);

      message.textContent = "❌ " + err.message;
      message.style.color = "red";
    }
  });

});