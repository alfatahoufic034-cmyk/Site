document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const adminFullName = document.getElementById("adminFullName");
  const adminEmail = document.getElementById("adminEmail");
  const adminPhone = document.getElementById("adminPhone");
  const adminCreatedAt = document.getElementById("adminCreatedAt");
  const adminInitials = document.getElementById("adminInitials");
  const profileMessage = document.getElementById("profileMessage");

  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const newPasswordInput = document.getElementById("newPassword");

  const adminProfileForm = document.getElementById("adminProfileForm");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentUser = null;

  // =====================================
  // SECURITE SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    return;
  }

  // =====================================
  // VERIFICATION SESSION + ADMIN
  // =====================================
  async function checkAdminSession() {
    try {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      if (error || !session) {
        window.location.href = "../auth/login.html";
        return null;
      }

      const user = session.user;

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.is_admin !== true) {
        await supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
      }

      return user;

    } catch (err) {
      console.error("❌ Erreur session admin :", err.message);
      window.location.href = "../auth/login.html";
      return null;
    }
  }

  // =====================================
  // CHARGER PROFIL
  // =====================================
  async function loadProfile(user) {
    try {
      currentUser = user;

      let { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("nom, prenom, phone, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      // si profil absent → création automatique
      if (!profile) {
        const defaultProfile = {
          id: user.id,
          nom: "",
          prenom: "",
          phone: "",
          is_admin: true
        };

        const { error: insertError } = await supabaseClient
          .from("profiles")
          .upsert(defaultProfile);

        if (insertError) {
          console.error(insertError.message);
        }

        profile = defaultProfile;
      }

      const nom = profile.nom || "";
      const prenom = profile.prenom || "";
      const phone = profile.phone || "";
      const fullName = `${prenom} ${nom}`.trim() || "Administrateur";

      // affichage carte
      if (adminFullName) adminFullName.textContent = fullName;
      if (adminEmail) adminEmail.textContent = user.email || "-";
      if (adminPhone) adminPhone.textContent = phone || "Non renseigné";

      if (adminCreatedAt) {
        adminCreatedAt.textContent = user.created_at
          ? new Date(user.created_at).toLocaleDateString("fr-FR")
          : "-";
      }

      if (adminInitials) {
        const first = prenom.charAt(0) || "A";
        const second = nom.charAt(0) || "D";
        adminInitials.textContent = `${first}${second}`.toUpperCase();
      }

      // remplir formulaire
      if (nomInput) nomInput.value = nom;
      if (prenomInput) prenomInput.value = prenom;
      if (emailInput) emailInput.value = user.email || "";
      if (phoneInput) phoneInput.value = phone;

    } catch (err) {
      console.error("❌ Erreur chargement profil :", err.message);

      if (adminFullName) adminFullName.textContent = "Administrateur";
      if (adminEmail) adminEmail.textContent = "-";
      if (adminPhone) adminPhone.textContent = "Non renseigné";
      if (adminCreatedAt) adminCreatedAt.textContent = "-";
      if (adminInitials) adminInitials.textContent = "AD";
    }
  }

  // =====================================
  // UPDATE PROFIL
  // =====================================
  async function updateProfile(e) {
    e.preventDefault();

    if (!currentUser) return;

    const nom = nomInput?.value.trim();
    const prenom = prenomInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const newPassword = newPasswordInput?.value.trim();

    if (!nom || !prenom || !phone) {
      profileMessage.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      profileMessage.style.color = "red";
      return;
    }

    profileMessage.textContent = "⏳ Mise à jour en cours...";
    profileMessage.style.color = "#FFD700";

    try {
      // update profile table
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          nom,
          prenom,
          phone
        })
        .eq("id", currentUser.id);

      if (profileError) throw profileError;

      // update password si rempli
      if (newPassword && newPassword.length >= 6) {
        const { error: passwordError } = await supabaseClient.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;
      }

      profileMessage.textContent = "✅ Profil mis à jour avec succès";
      profileMessage.style.color = "green";

      newPasswordInput.value = "";

      await loadProfile(currentUser);

    } catch (err) {
      console.error("❌ Erreur update profil :", err.message);

      profileMessage.textContent =
        "❌ " + (err.message || "Erreur inconnue");
      profileMessage.style.color = "red";
    }
  }

  // =====================================
  // LOGOUT
  // =====================================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      await supabaseClient.auth.signOut();
      window.location.href = "../auth/login.html";
    });
  }

  // =====================================
  // FORM SUBMIT
  // =====================================
  if (adminProfileForm) {
    adminProfileForm.addEventListener("submit", updateProfile);
  }

  // =====================================
  // START
  // =====================================
  const user = await checkAdminSession();
  if (!user) return;

  await loadProfile(user);

});