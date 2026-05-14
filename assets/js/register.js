document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  if (!form || !msg) {
    console.error("❌ Formulaire ou message introuvable");
    return;
  }

  function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#+_\-])[A-Za-z\d@$!%*?&#+_\-]{8,}$/;
    return regex.test(password);
  }

  const passwordInput = document.getElementById("password");
  const bar = document.getElementById("passwordStrengthBar");
  const text = document.getElementById("passwordStrengthText");

  function checkStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&#+_\-]/.test(password)) score++;
    return score;
  }

  passwordInput?.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkStrength(password);

    let width = 0;
    let color = "red";
    let label = "Faible";

    if (strength === 1) {
      width = 25;
      label = "Faible";
    } else if (strength === 2 || strength === 3) {
      width = 60;
      color = "orange";
      label = "Moyen";
    } else if (strength === 4) {
      width = 100;
      color = "green";
      label = "Fort";
    }

    bar.style.width = width + "%";
    bar.style.background = color;
    text.textContent = "Force : " + label;
    text.style.color = color;
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

    if (!nom || !prenom || !email || !phone || !password || !confirmPassword) {
      msg.textContent = "❌ Tous les champs sont obligatoires";
      msg.style.color = "red";
      return;
    }

    if (!validatePassword(password)) {
      msg.textContent = "❌ Mot de passe faible : 8+ caractères, lettres, chiffres et symbole requis";
      msg.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "⏳ ALFA IT SERVICE : Création du compte...";
    msg.style.color = "#FFD700";

    try {

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
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
        throw new Error("Création utilisateur échouée");
      }

      // 👤 CREATE PROFILE
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert([
          {
            id: user.id,
            nom,
            prenom,
            phone,
            email,
            is_admin: false,
            created_at: new Date().toISOString()
          }
        ], {
          onConflict: "id"
        });

      if (profileError) throw profileError;

      // 📩 MESSAGE FINAL ENTREPRISE
      msg.textContent =
        "📩 ALFA IT SERVICE : Un email de confirmation a été envoyé. Vérifiez votre boîte mail pour activer votre compte.";
      msg.style.color = "green";

      form.reset();

      setTimeout(() => {
        window.location.href = "check-email.html";
      }, 2500);

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
        msg.textContent = "❌ Erreur de sécurité Supabase (RLS)";
      }
      else {
        msg.textContent = "❌ " + (err.message || "Erreur inconnue");
      }

      msg.style.color = "red";
    }

  });

});