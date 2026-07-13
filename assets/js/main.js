function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      element.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);













// ==========================================
// NAVBAR MOBILE - START
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Sélection des éléments du menu mobile
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const closeBtn = document.getElementById('closeBtn');
  const navLinks = document.querySelectorAll('.mobile-nav-list a');

  // Protection : si la structure de la navbar n'existe pas sur la page,
  // on sort proprement pour éviter les erreurs JS qui bloquent d'autres scripts.
  if (!hamburger || !mobileMenu || !mobileMenuOverlay || !closeBtn) {
    return;
  }

  // Fonction pour ouvrir le menu
  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Fonction pour fermer le menu
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Clic sur le hamburger pour ouvrir le menu
  hamburger.addEventListener('click', openMenu);

  // Clic sur le bouton X pour fermer le menu
  closeBtn.addEventListener('click', closeMenu);

  // Clic sur l'overlay pour fermer le menu
  mobileMenuOverlay.addEventListener('click', closeMenu);

  // Clic sur un lien pour fermer le menu (si présents)
  if (navLinks && navLinks.length) {
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
});

// ==========================================
// NAVBAR MOBILE - END
// ==========================================











// ===== AUTO REMPLISSAGE SERVICE =====
const params = new URLSearchParams(window.location.search);
const service = params.get("service");

if (service && document.getElementById("service")) {
  document.getElementById("service").value = service;
}

// ===== ENVOI FORMULAIRE DEMANDE =====
if (document.getElementById("serviceForm")) {
  document.getElementById("serviceForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if(name === "" || email === ""){
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    document.getElementById("successMessage").innerText =
      "✅ Votre demande a été envoyée avec succès !";

    // reset formulaire
    this.reset();
  });
}

// ===== ENVOI FORMULAIRE CONTACT =====
if (document.getElementById("contactForm")) {
  document.getElementById("contactForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if(name === "" || email === ""){
      alert("Veuillez remplir tous les champs");
      return;
    }

    document.getElementById("successMsg").innerText =
      "✅ Message envoyé avec succès !";

    this.reset();
  });
}

// ===== FORMULAIRE INSCRIPTION =====
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", function(e){
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if(password !== confirm){
      message.style.color = "red";
      message.innerText = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    message.style.color = "green";
    message.innerText = "✅ Compte créé avec succès !";

    this.reset();
  });
}











/* ===========================
   IMAGE SERVICES POPUP
=========================== */

const images =
document.querySelectorAll(".service-block img");

const modal =
document.getElementById("imageModal");

const popup =
document.getElementById("popupImage");

const closeBtn =
document.querySelector(".close-image");

images.forEach(img=>{

img.addEventListener("click",()=>{

popup.src =
img.src;

modal.classList.add("show");

document.body.classList.add(
"modal-open"
);

});

});

function closeModal(){

modal.classList.remove(
"show"
);

document.body.classList.remove(
"modal-open"
);

}

closeBtn.addEventListener(
"click",
closeModal
);

modal.addEventListener(
"click",
(e)=>{

if(
e.target===modal
){

closeModal();

}

});

document.addEventListener(
"keydown",
(e)=>{

if(
e.key==="Escape"
){

closeModal();

}

});