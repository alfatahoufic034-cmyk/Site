document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("avisForm");
  const feedback = document.getElementById("feedback");
  const avisList = document.getElementById("avisList");
  const stars = document.querySelectorAll(".star");
  const messageInput = document.getElementById("messageText");

  let selectedNote = 0;

  if (!form || !feedback || !avisList || !messageInput) {
    console.error("❌ Eléments avis introuvables");
    return;
  }

  // =====================================
  // ⭐ STARS
  // =====================================
  function updateStars(note) {
    stars.forEach((star) => {
      const value = parseInt(star.dataset.value);
      star.classList.toggle("active", value <= note);
    });
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedNote = parseInt(star.dataset.value);
      updateStars(selectedNote);
    });
  });

  // =====================================
  // 🔐 USER
  // =====================================
  async function getCurrentUser() {
    const { data: { session }, error } =
      await supabaseClient.auth.getSession();

    if (error || !session) return null;
    return session.user;
  }

  // =====================================
  // 📥 LOAD AVIS
  // =====================================
  async function loadAvis() {
    try {
      const { data, error } = await supabaseClient
        .from("avis")
        .select("email, note, message, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        avisList.innerHTML = `<div class="avis-card"><p>Aucun avis pour le moment.</p></div>`;
        return;
      }

      avisList.innerHTML = data.map((avis) => {
        const starsDisplay =
          "★".repeat(avis.note) + "☆".repeat(5 - avis.note);

        return `
          <div class="avis-card">
            <h3>${avis.email}</h3>
            <p class="avis-stars">${starsDisplay}</p>
            <p>${avis.message}</p>
            <small>${new Date(avis.created_at).toLocaleDateString("fr-FR")}</small>
          </div>
        `;
      }).join("");

    } catch (err) {
      console.error("❌ LOAD AVIS ERROR :", err.message);
      avisList.innerHTML = `<div class="avis-card"><p>Erreur chargement avis</p></div>`;
    }
  }

  // =====================================
  // 🚀 SUBMIT
  // =====================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();

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

    const user = await getCurrentUser();

    if (!user) {
      feedback.textContent = "❌ Vous devez être connecté.";
      feedback.style.color = "red";
      return;
    }

    feedback.textContent = "⏳ Envoi...";
    feedback.style.color = "#FFD700";

    try {

      // =====================================
      // INSERT SUPABASE
      // =====================================
      const { error } = await supabaseClient
        .from("avis")
        .insert([{
          user_id: user.id,
          email: user.email,
          note: selectedNote,
          message: message
        }]);

      if (error) throw error;

      // =====================================
      // EMAILJS NOTIFICATION ADMIN
      // =====================================
      if (typeof emailjs !== "undefined") {
        await emailjs.send(
          "service_hskelrg",
          "template_qshwyx8",
          {
            type: "Nouvel avis client",
            email: user.email,
            note: selectedNote,
            message: message
          },
          "KusED4VK8YahzB6qu"
        );
      }

      // =====================================
      // SUCCESS
      // =====================================
      feedback.textContent = "✅ Avis envoyé avec succès !";
      feedback.style.color = "green";

      form.reset();
      selectedNote = 0;
      updateStars(0);

      await loadAvis();

    } catch (err) {
      console.error("❌ ERROR :", err.message);

      feedback.textContent =
        "❌ Erreur : " + (err.message || "inconnue");

      feedback.style.color = "red";
    }
  });

  // =====================================
  // INIT
  // =====================================
  await loadAvis();

});