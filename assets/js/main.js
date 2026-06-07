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

// ===== AUTO REMPLISSAGE SERVICE =====
const params = new URLSearchParams(window.location.search);
const service = params.get("service");

if (service) {
  document.getElementById("service").value = service;
}

// ===== ENVOI FORMULAIRE =====
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












document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

});