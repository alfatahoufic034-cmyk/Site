document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // 📌 ELEMENTS
  // =====================================
  const form = document.getElementById("avisForm");
  const feedback = document.getElementById("feedback");
  const avisList = document.getElementById("avisList");
  const stars = document.querySelectorAll(".star");

  let selectedNote = 0;

  // sécurité DOM
  if (!form || !feedback || !avisList) {
    console.error("❌ Eléments avis introuvables");
    return;
  }

  // =====================================
  // ⭐ GESTION DES ETOILES
  // =====================================
  function updateStars(note) {
    stars.forEach((star) => {
      const value = parseInt(star.dataset.value);

      if (value <= note) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedNote = parseInt(star.dataset.value);
      updateStars(selectedNote);
    });
  });

  // =====================================
  // 🔐 SESSION UTILISATEUR
  // =====================================
  async function getCurrentUser() {
    try {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session.user;

    } catch (err) {
      console.error("Erreur session :", err.message);
      return null;
    }
  }

  // =====================================
  // 📥 CHARGER LES AVIS
  // =====================================
  async function loadAvis() {
    try {
      const { data, error } = await supabaseClient
        .from("avis")
        .select("email, note, message, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        avisList.innerHTML = `
          <div class="avis-card">
            <p>Aucun avis pour le moment.</p>
          </div>
        `;
        return;
      }

      avisList.innerHTML = data.map((avis) => {
        const starsDisplay = "★".repeat(avis.note) + "☆".repeat(5 - avis.note);

        return `
          <div class="avis-card">
            <h3>${avis.email}</h3>
            <p class="avis-stars">${starsDisplay}</p>
            <p>${avis.message}</p>
            <small>
              ${new Date(avis.created_at).toLocaleDateString("fr-FR")}
            </small>
          </div>
        `;
      }).join("");

    } catch (err) {
      console.error("❌ Erreur chargement avis :", err.message);

      avisList.innerHTML = `
        <div class="avis-card">
          <p>Erreur lors du chargement des avis.</p>
        </div>
      `;
    }
  }

  // =====================================
  // 🚀 ENVOI DU FORMULAIRE
  // =====================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = document.getElementById("messageText")?.value.trim();

    feedback.textContent = "";
    feedback.style.color = "";

    // validation
    if (selectedNote === 0) {
      feedback.textContent = "❌ Veuillez choisir une note.";
      feedback.style.color = "red";
      return;
    }

    if (!message) {
      feedback.textContent = "❌ Veuillez écrire votre avis.";
      feedback.style.color = "red";
      return;
    }

    // utilisateur connecté
    const user = await getCurrentUser();

    if (!user) {
      feedback.textContent = "❌ Vous devez être connecté pour laisser un avis.";
      feedback.style.color = "red";
      return;
    }

    feedback.textContent = "⏳ Envoi de votre avis...";
    feedback.style.color = "#FFD700";

    try {
      const { error } = await supabaseClient
        .from("avis")
        .insert([
          {
            user_id: user.id,
            email: user.email,
            note: selectedNote,
            message: message
          }
        ]);

      if (error) throw error;

      feedback.textContent = "✅ Avis envoyé avec succès !";
      feedback.style.color = "green";

      form.reset();
      selectedNote = 0;
      updateStars(0);

      await loadAvis();

    } catch (err) {
      console.error("❌ Erreur envoi avis :", err.message);

      feedback.textContent =
        "❌ Erreur lors de l’envoi : " + err.message;
      feedback.style.color = "red";
    }
  });

  // =====================================
  // 🚀 LANCEMENT
  // =====================================
  await loadAvis();

});