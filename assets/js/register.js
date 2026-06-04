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

  const passwordInput = document.getElementById("password");
  const bar = document.getElementById("passwordStrengthBar");
  const text = document.getElementById("passwordStrengthText");

  function checkStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    return score;
  }

  passwordInput?.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkStrength(password);

    let width = 0;
    let color = "red";
    let label = "Faible";

    if (strength <= 1) {
      width = 30;
      color = "red";
      label = "Faible";
    } else if (strength === 2 || strength === 3) {
      width = 65;
      color = "orange";
      label = "Moyen";
    } else {
      width = 100;
      color = "green";
      label = "Fort";
    }

    if (bar) {
      bar.style.width = width + "%";
      bar.style.background = color;
    }

    if (text) {
      text.textContent = "Force : " + label;
      text.style.color = color;
    }
  });

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

    // ❌ password
    if (!validatePassword(password)) {
      msg.textContent = "❌ Mot de passe trop court (minimum 6 caractères)";
      msg.style.color = "red";
      return;
    }

    // ❌ confirmation
    if (password !== confirmPassword) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "⏳ ALFA IT SERVICE : Création du compte...";
    msg.style.color = "#FFD700";

    try {

      // 🔥 SIGNUP SUPABASE
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

      // 🔥 IMPORTANT : USER SAFE CHECK
      const user = data?.user;

      if (!user || !user.id) {
        throw new Error("Utilisateur Supabase non créé correctement");
      }

      /**
       * ⚠️ IMPORTANT FIX FK:
       * On NE dépend plus du timing Supabase
       * On laisse un trigger ou on sécurise le fallback
       */

      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert(
          {
            id: user.id,
            nom,
            prenom,
            phone,
            email,
            is_admin: false,
            created_at: new Date().toISOString()
          },
          {
            onConflict: "id"
          }
        );

      /**
       * 🔥 FIX IMPORTANT:
       * si FK casse encore → c’est DB (pas JS)
       */
      if (profileError) {
        console.error("PROFILE ERROR:", profileError);

        throw new Error(
          "Erreur profil (RLS ou FK). Vérifie la table profiles"
        );
      }

      // 📩 SUCCESS MESSAGE
      msg.textContent =
        "📩 Un email de confirmation a été envoyé. Vérifie ta boîte mail pour activer ton compte.";
      msg.style.color = "green";

      form.reset();

      setTimeout(() => {
        window.location.href = "check-email.html";
      }, 4000);

    } catch (err) {

      console.error("❌ Erreur inscription :", err);

      if (
        err.message?.includes("User already registered") ||
        err.message?.includes("already registered")
      ) {
        msg.textContent = "❌ Cet email est déjà utilisé";
      }
      else if (
        err.message?.includes("row-level security") ||
        err.message?.includes("violates row-level security policy")
      ) {
        msg.textContent = "❌ Erreur Supabase (RLS)";
      }
      else if (
        err.message?.includes("foreign key") ||
        err.message?.includes("profiles_id_fkey")
      ) {
        msg.textContent =
          "❌ FK error : utilise un trigger Supabase (solution recommandée)";
      }
      else {
        msg.textContent = "❌ " + (err.message || "Erreur inconnue");
      }

      msg.style.color = "red";
    }

  });

});