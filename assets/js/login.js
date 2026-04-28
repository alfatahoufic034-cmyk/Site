document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  if (!form || !msg) {
    console.error("❌ Formulaire login introuvable");
    return;
  }

  // =====================================
  // VERIFIER SESSION EXISTANTE
  // =====================================
  async function checkExistingSession() {
    try {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error("Erreur session :", error.message);
        return;
      }

      if (session && session.user) {
        msg.textContent = "ℹ️ Vous êtes déjà connecté.";
        msg.style.color = "#FFD700";
      }

    } catch (err) {
      console.error("Erreur session :", err.message);
    }
  }

  checkExistingSession();

  // =====================================
  // LOGIN
  // =====================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    msg.textContent = "";
    msg.style.color = "";

    // =====================================
    // VALIDATION
    // =====================================
    if (!email || !password) {
      msg.textContent = "❌ Tous les champs sont obligatoires";
      msg.style.color = "red";
      return;
    }

    // =====================================
    // CHARGEMENT
    // =====================================
    msg.textContent = "⏳ Connexion en cours...";
    msg.style.color = "#FFD700";

    try {
      // =====================================
      // AUTH LOGIN
      // =====================================
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error("Utilisateur introuvable");
      }

      // =====================================
      // RECUPERATION PROFIL
      // =====================================
      const {
        data: profile,
        error: profileError
      } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("Profil utilisateur introuvable");
      }

      // =====================================
      // SUCCES
      // =====================================
      msg.textContent = "✅ Connexion réussie";
      msg.style.color = "green";

      form.reset();

      // =====================================
      // REDIRECTION SELON is_admin
      // =====================================
      setTimeout(() => {
        if (profile.is_admin === true) {
          window.location.href = "../admin/dashboard.html";
        } else {
          window.location.href = "../client/dashboard.html";
        }
      }, 1500);

    } catch (err) {
      console.error("❌ Erreur login :", err);

      if (
        err.message.includes("Invalid login credentials")
      ) {
        msg.textContent = "❌ Email ou mot de passe incorrect";
      } else {
        msg.textContent = "❌ " + err.message;
      }

      msg.style.color = "red";
    }
  });

});