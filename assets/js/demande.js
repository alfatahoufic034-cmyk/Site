document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("serviceForm");
  const messageBox = document.getElementById("successMessage");

  if (!form) {
    console.error("❌ Formulaire serviceForm introuvable");
    return;
  }

  if (!messageBox) {
    console.error("❌ Message successMessage introuvable");
    return;
  }


  // =====================================
  // VERIFICATION SUPABASE
  // =====================================
  if (typeof supabaseClient === "undefined") {
    console.error("❌ supabaseClient introuvable");
    messageBox.textContent =
      "❌ Erreur de connexion au serveur";
    messageBox.style.color = "red";
    return;
  }


  // =====================================
  // ENVOI FORMULAIRE
  // =====================================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();


    // Eviter double clic
    const button = form.querySelector("button[type='submit']");

    if (button) {
      button.disabled = true;
      button.innerText = "Envoi...";
    }


    // =====================================
    // RECUPERATION CHAMPS
    // =====================================

    const nomComplet =
      document.getElementById("name")?.value.trim() || "";

    const email =
      document.getElementById("email")?.value.trim() || "";

    const telephone =
      document.getElementById("phone")?.value.trim() || "";

    const service =
      document.getElementById("service")?.value || "";

    const description =
      document.getElementById("description")?.value.trim() || "";

    const localisation =
      document.getElementById("location")?.value.trim() || null;



    console.log({
      nomComplet,
      email,
      telephone,
      service,
      description,
      localisation
    });



    // =====================================
    // VALIDATION
    // =====================================

    if (
      nomComplet === "" ||
      email === "" ||
      telephone === "" ||
      service === "" ||
      description === ""
    ) {

      messageBox.textContent =
        "❌ Veuillez remplir tous les champs obligatoires.";

      messageBox.style.color = "red";


      if (button) {
        button.disabled = false;
        button.innerText = "Envoyer la demande";
      }

      return;
    }



    try {


      // =====================================
      // VERIFICATION UTILISATEUR
      // =====================================

      const {
        data: { user },
        error: userError

      } = await supabaseClient.auth.getUser();



      if (userError || !user) {

        throw new Error(
          "Vous devez être connecté pour envoyer une demande."
        );

      }



      // =====================================
      // MESSAGE CHARGEMENT
      // =====================================

      messageBox.textContent =
        "⏳ Envoi de votre demande...";

      messageBox.style.color = "#FFD700";



      // =====================================
      // INSERT DATABASE
      // =====================================

      const { error } = await supabaseClient
        .from("demandes")
        .insert({

          user_id: user.id,
          nom_complet: nomComplet,
          email: email,
          telephone: telephone,
          service: service,
          description: description,
          localisation: localisation,
          statut: "en_cours"

        });



      if (error) {

        console.error(
          "Erreur Supabase :",
          error
        );

        throw error;

      }



      // =====================================
      // EMAIL ADMIN
      // =====================================

      if (typeof emailjs !== "undefined") {

        try {

          await emailjs.send(
            "service_hskelrg",
            "template_qshwyx8",
            {

              nom_complet: nomComplet,
              email: email,
              telephone: telephone,
              service: service,
              description: description,
              localisation:
                localisation || "Non renseignée",
              type_notification:
                "Nouvelle demande de service"

            }
          );

        } catch(emailError){

          console.warn(
            "Email non envoyé :",
            emailError
          );

        }

      }



      // =====================================
      // SUCCES
      // =====================================

      messageBox.textContent =
        "✅ Votre demande a été envoyée avec succès !";

      messageBox.style.color = "green";


      form.reset();



      setTimeout(() => {

        window.location.href =
          "client/dashboard.html";

      },2000);



    }

    catch(error){


      console.error(
        "❌ Erreur demande :",
        error
      );


      messageBox.textContent =
        "❌ " + error.message;


      messageBox.style.color =
        "red";


    }



    finally {


      if(button){

        button.disabled = false;
        button.innerText =
          "Envoyer la demande";

      }

    }


  });


});