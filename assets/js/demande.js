document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const form = document.getElementById("serviceForm");
  const messageBox = document.getElementById("successMessage");

  const imagesInput = document.getElementById("images");
  const imagePreview = document.getElementById("imagePreview");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
  const MAX_IMAGES = 5;

  let selectedFiles = [];


  // =====================================
  // VERIFICATION FORMULAIRE
  // =====================================
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
  // GESTION DES IMAGES
  // =====================================
  if (imagesInput) {

    imagesInput.addEventListener("change", () => {

      const files = Array.from(imagesInput.files);

      // Nombre maximum
      if (selectedFiles.length + files.length > MAX_IMAGES) {

        alert(
          `❌ Vous pouvez ajouter au maximum ${MAX_IMAGES} images.`
        );

        imagesInput.value = "";

        return;
      }


      files.forEach((file) => {

        // Formats autorisés
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

          alert(
            `❌ "${file.name}" n'est pas autorisé.\n\n` +
            `Formats acceptés : JPG, PNG et WEBP.`
          );

          return;
        }


        // Taille maximale
        if (file.size > MAX_FILE_SIZE) {

          alert(
            `❌ "${file.name}" dépasse la taille maximale de 5 Mo.`
          );

          return;
        }


        selectedFiles.push(file);

      });


      updateFileInput();
      displayImagePreview();

    });

  }


  // =====================================
  // METTRE A JOUR INPUT FILE
  // =====================================
  function updateFileInput() {

    if (!imagesInput) return;

    const dataTransfer = new DataTransfer();

    selectedFiles.forEach((file) => {

      dataTransfer.items.add(file);

    });

    imagesInput.files = dataTransfer.files;

  }


  // =====================================
  // APERCU DES IMAGES
  // =====================================
  function displayImagePreview() {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";


    selectedFiles.forEach((file, index) => {

      const reader = new FileReader();


      reader.onload = (e) => {

        const container =
          document.createElement("div");

        container.className =
          "image-preview-item";


        // IMAGE
        const image =
          document.createElement("img");

        image.src =
          e.target.result;

        image.alt =
          `Image ${index + 1}`;


        // BOUTON SUPPRIMER
        const removeButton =
          document.createElement("button");

        removeButton.type =
          "button";

        removeButton.className =
          "image-remove";

        removeButton.innerHTML =
          "×";

        removeButton.title =
          "Supprimer cette image";


        removeButton.addEventListener(
          "click",
          () => {

            selectedFiles.splice(index, 1);

            updateFileInput();

            displayImagePreview();

          }
        );


        container.appendChild(image);

        container.appendChild(removeButton);

        imagePreview.appendChild(container);

      };


      reader.readAsDataURL(file);

    });

  }


  // =====================================
  // UPLOAD DES IMAGES SUPABASE
  // =====================================
  async function uploadImages(userId) {

    if (selectedFiles.length === 0) {

      return [];

    }


    const uploadedPaths = [];


    for (const file of selectedFiles) {

      // Extension
      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      // Nom unique
      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;


      // Chemin dans Storage
      const filePath =
        `${userId}/${fileName}`;


      console.log(
        "📤 Upload image :",
        filePath
      );


      const {
        error: uploadError
      } = await supabaseClient
        .storage
        .from("demandes-images")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          }
        );


      if (uploadError) {

        console.error(
          "❌ Erreur upload image :",
          uploadError
        );

        throw new Error(
          `Impossible d'envoyer l'image "${file.name}".`
        );

      }


      uploadedPaths.push(filePath);

    }


    return uploadedPaths;

  }


  // =====================================
  // ENVOI FORMULAIRE
  // =====================================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();


    // =====================================
    // EVITER DOUBLE CLIC
    // =====================================
    const button =
      form.querySelector(
        "button[type='submit']"
      );


    if (button) {

      button.disabled = true;

      button.innerText =
        "Envoi...";

    }


    // =====================================
    // RECUPERATION CHAMPS
    // =====================================
    const nomComplet =
      document
        .getElementById("name")
        ?.value
        .trim() || "";


    const email =
      document
        .getElementById("email")
        ?.value
        .trim() || "";


    const telephone =
      document
        .getElementById("phone")
        ?.value
        .trim() || "";


    const service =
      document
        .getElementById("service")
        ?.value || "";


    const description =
      document
        .getElementById("description")
        ?.value
        .trim() || "";


    const localisation =
      document
        .getElementById("location")
        ?.value
        .trim() || null;


    console.log({
      nomComplet,
      email,
      telephone,
      service,
      description,
      localisation,
      nombreImages: selectedFiles.length
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

      messageBox.style.color =
        "red";


      if (button) {

        button.disabled = false;

        button.innerText =
          "Envoyer la demande";

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
      // UPLOAD IMAGES
      // =====================================
      let imagePaths = [];


      if (selectedFiles.length > 0) {

        messageBox.textContent =
          "📷 Envoi des images...";

        messageBox.style.color =
          "#FFD700";


        imagePaths =
          await uploadImages(user.id);

      }


      // =====================================
      // MESSAGE CHARGEMENT
      // =====================================
      messageBox.textContent =
        "⏳ Enregistrement de votre demande...";

      messageBox.style.color =
        "#FFD700";


      // =====================================
      // INSERT DATABASE
      // =====================================
      const { error } =
        await supabaseClient
          .from("demandes")
          .insert({

            user_id:
              user.id,

            nom_complet:
              nomComplet,

            email:
              email,

            telephone:
              telephone,

            service:
              service,

            description:
              description,

            localisation:
              localisation,

            statut:
              "en_cours",

            images:
              imagePaths

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

              nom_complet:
                nomComplet,

              email:
                email,

              telephone:
                telephone,

              service:
                service,

              description:
                description,

              localisation:
                localisation ||
                "Non renseignée",

              type_notification:
                "Nouvelle demande de service"

            }

          );

        } catch (emailError) {

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

      messageBox.style.color =
        "green";


      // Reset formulaire
      form.reset();

      selectedFiles = [];


      if (imagePreview) {

        imagePreview.innerHTML = "";

      }


      // =====================================
      // REDIRECTION
      // =====================================
      setTimeout(() => {

        window.location.href =
          "client/dashboard.html";

      }, 2000);


    } catch (error) {

      console.error(
        "❌ Erreur demande :",
        error
      );


      messageBox.textContent =
        "❌ " + error.message;


      messageBox.style.color =
        "red";

    }


    // =====================================
    // FIN
    // =====================================
    finally {

      if (button) {

        button.disabled = false;

        button.innerText =
          "Envoyer la demande";

      }

    }

  });

});