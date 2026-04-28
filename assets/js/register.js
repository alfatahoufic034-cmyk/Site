document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // 📌 RÉCUPÉRATION DES ÉLÉMENTS
  // =====================================
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  // Sécurité DOM
  if (!form || !msg) {
    console.error("❌ Formulaire ou message introuvable");
    return;
  }

  // =====================================
  // 🔐 VALIDATION MOT DE PASSE PRO
  // =====================================
  function validatePassword(password) {
    // Minimum 8 caractères, 1 lettre, 1 chiffre, 1 symbole
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
    color = "red";
    label = "Faible";
  } 
  else if (strength === 2 || strength === 3) {
    width = 60;
    color = "orange";
    label = "Moyen";
  } 
  else if (strength === 4) {
    width = 100;
    color = "green";
    label = "Fort";
  }

  bar.style.width = width + "%";
  bar.style.background = color;
  text.textContent = "Force : " + label;
  text.style.color = color;
});

  // =====================================
  // 🚀 SOUMISSION DU FORMULAIRE
  // =====================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // =====================================
    // 📥 RÉCUPÉRATION DES DONNÉES
    // =====================================
    const nom = document.getElementById("nom")?.value.trim();
    const prenom = document.getElementById("prenom")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    // Reset message
    msg.textContent = "";
    msg.style.color = "";

    // =====================================
    // 🔒 VALIDATIONS
    // =====================================
    if (!nom || !prenom || !email || !phone || !password || !confirmPassword) {
      msg.textContent = "❌ Tous les champs sont obligatoires";
      msg.style.color = "red";
      return;
    }

    // 🔥 AJOUT IMPORTANT : validation forte password
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

    // =====================================
    // ⏳ MESSAGE DE CHARGEMENT
    // =====================================
    msg.textContent = "⏳ Création du compte...";
    msg.style.color = "#FFD700";

    try {

      // =====================================
      // 🔐 INSCRIPTION AUTH SUPABASE
      // =====================================
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nom: nom,
            prenom: prenom,
            phone: phone
          }
        }
      });

      if (error) {
        throw error;
      }

      // =====================================
      // ⚠️ VÉRIFICATION USER
      // =====================================
      const user = data?.user;

      if (!user) {
        throw new Error("Impossible de récupérer l'utilisateur créé");
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // =====================================
      // 👤 INSERTION TABLE PROFILES
      // =====================================
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert([
          {
            id: user.id,
            nom: nom,
            prenom: prenom,
            phone: phone,
            email: email,
            is_admin: false,
            created_at: new Date().toISOString()
          }
        ], {
          onConflict: "id"
        });

      if (profileError) {
        throw profileError;
      }

      // =====================================
      // ✅ SUCCÈS
      // =====================================
      msg.textContent = "✅ Compte créé avec succès ! Vérifiez votre email.";
      msg.style.color = "green";

      form.reset();

      setTimeout(() => {
        window.location.href = "login.html";
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