document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  if (!form || !msg) {
    console.error("❌ Formulaire ou message introuvable");
    return;
  }

  // 🔓 PASSWORD SIMPLE
  function validatePassword(password) {
    return password && password.length >= 6;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("nom")?.value.trim();
    const prenom = document.getElementById("prenom")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    msg.textContent = "";
    msg.style.color = "";

    // ❌ validation champs
    if (!nom || !prenom || !email || !phone || !password || !confirmPassword) {
      msg.textContent = "❌ Tous les champs sont obligatoires";
      msg.style.color = "red";
      return;
    }

    if (!validatePassword(password)) {
      msg.textContent = "❌ Mot de passe trop court (min 6 caractères)";
      msg.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "⏳ Création du compte en cours...";
    msg.style.color = "#FFD700";

    try {

      // 🔥 INSCRIPTION SUPABASE
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://lucent-biscuit-2c759b.netlify.app/",
          data: {
            nom,
            prenom,
            phone
          }
        }
      });

      if (error) throw error;

      const user = data?.user;

      if (!user) {
        throw new Error("Erreur création utilisateur");
      }

      // ✅ SUCCESS IMMÉDIAT (IMPORTANT)
      msg.textContent = "📩 Compte créé ! Vérifie ton email pour confirmer ton inscription.";
      msg.style.color = "green";

      form.reset();

      // 🔁 REDIRECTION
      setTimeout(() => {
        window.location.href = "check-email.html";
      }, 2500);

    } catch (err) {

      console.error("❌ Erreur inscription :", err);

      if (err.message?.includes("User already registered")) {
        msg.textContent = "❌ Cet email est déjà utilisé";
      }
      else if (err.message?.includes("Database error")) {
        msg.textContent = "❌ Erreur serveur Supabase";
      }
      else {
        msg.textContent = "❌ " + (err.message || "Erreur inconnue");
      }

      msg.style.color = "red";
    }

  });

});