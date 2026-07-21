// ==========================================
// REVEAL ON SCROLL
// ==========================================

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
// NAVBAR MOBILE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {


  const hamburger =
    document.getElementById("hamburger");

  const mobileMenu =
    document.getElementById("mobileMenu");

  const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");

  const closeBtn =
    document.getElementById("closeBtn");

  const navLinks =
    document.querySelectorAll(".mobile-nav-list a");



  if (
    hamburger &&
    mobileMenu &&
    mobileMenuOverlay &&
    closeBtn
  ) {


    function openMenu(){

      hamburger.classList.add("active");
      mobileMenu.classList.add("active");
      mobileMenuOverlay.classList.add("active");

      document.body.style.overflow = "hidden";

    }



    function closeMenu(){

      hamburger.classList.remove("active");
      mobileMenu.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");

      document.body.style.overflow = "auto";

    }



    hamburger.addEventListener(
      "click",
      openMenu
    );


    closeBtn.addEventListener(
      "click",
      closeMenu
    );


    mobileMenuOverlay.addEventListener(
      "click",
      closeMenu
    );



    navLinks.forEach(link=>{

      link.addEventListener(
        "click",
        closeMenu
      );

    });


  }



});




// ==========================================
// AUTO REMPLISSAGE SERVICE
// ==========================================

const params =
new URLSearchParams(window.location.search);


const service =
params.get("service");


const serviceInput =
document.getElementById("service");


if(service && serviceInput){

  serviceInput.value = service;

}




// ==========================================
// FORMULAIRE CONTACT
// ==========================================

const contactForm =
document.getElementById("contactForm");


if(contactForm){


  contactForm.addEventListener(
    "submit",
    function(e){


      e.preventDefault();


      const name =
      document.getElementById("name")?.value.trim();


      const email =
      document.getElementById("email")?.value.trim();


      const message =
      document.getElementById("successMsg");



      if(!name || !email){


        if(message){

          message.style.color="red";
          message.innerText =
          "❌ Veuillez remplir tous les champs";

        }


        return;

      }



      if(message){

        message.style.color="green";

        message.innerText =
        "✅ Message envoyé avec succès !";

      }



      contactForm.reset();


    }

  );


}




// ==========================================
// FORMULAIRE INSCRIPTION
// ==========================================

const registerForm =
document.getElementById("registerForm");


if(registerForm){


  registerForm.addEventListener(
    "submit",
    function(e){


      e.preventDefault();



      const password =
      document.getElementById("password")?.value;


      const confirmPassword =
      document.getElementById("confirmPassword")?.value;


      const message =
      document.getElementById("message");



      if(password !== confirmPassword){


        if(message){

          message.style.color="red";

          message.innerText =
          "❌ Les mots de passe ne correspondent pas";

        }


        return;

      }



      if(message){

        message.style.color="green";

        message.innerText =
        "✅ Compte créé avec succès !";

      }



      registerForm.reset();


    }

  );


}




// ==========================================
// IMAGE SERVICES POPUP
// ==========================================


const images =
document.querySelectorAll(
".service-block img"
);


const modal =
document.getElementById("imageModal");


const popup =
document.getElementById("popupImage");


const closeImageBtn =
document.querySelector(".close-image");



if(
images.length &&
modal &&
popup
){


  images.forEach(img=>{


    img.addEventListener(
      "click",
      ()=>{


        popup.src =
        img.src;


        modal.classList.add("show");


        document.body.classList.add(
          "modal-open"
        );


      }

    );


  });



  function closeModal(){


    modal.classList.remove(
      "show"
    );


    document.body.classList.remove(
      "modal-open"
    );


  }




  if(closeImageBtn){


    closeImageBtn.addEventListener(
      "click",
      closeModal
    );


  }




  modal.addEventListener(
    "click",
    (e)=>{


      if(e.target === modal){

        closeModal();

      }


    }

  );




  document.addEventListener(
    "keydown",
    (e)=>{


      if(e.key==="Escape"){

        closeModal();

      }


    }

  );


}