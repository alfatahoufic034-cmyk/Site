/* ==========================================
   ALFA IT SERVICES
   MAINTENANCE PAGE JAVASCRIPT
========================================== */


/*==============================
    CONFIGURATION
==============================*/


// Date prévue de fin de maintenance
const maintenanceEnd = new Date();

maintenanceEnd.setDate(
    maintenanceEnd.getDate() + 3
);

maintenanceEnd.setHours(23);
maintenanceEnd.setMinutes(59);
maintenanceEnd.setSeconds(59);



/*==============================
    COUNTDOWN
==============================*/


function updateCountdown(){


    const now = new Date().getTime();

    const distance =
        maintenanceEnd.getTime() - now;



    if(distance <= 0){

        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";

        return;

    }



    const days =
        Math.floor(distance / (1000 * 60 * 60 * 24));


    const hours =
        Math.floor(
            (distance % (1000 * 60 * 60 * 24))
            /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (distance % (1000 * 60 * 60))
            /
            (1000 * 60)
        );


    const seconds =
        Math.floor(
            (distance % (1000 * 60))
            /
            1000
        );



    document.getElementById("days").textContent =
        String(days).padStart(2,"0");


    document.getElementById("hours").textContent =
        String(hours).padStart(2,"0");


    document.getElementById("minutes").textContent =
        String(minutes).padStart(2,"0");


    document.getElementById("seconds").textContent =
        String(seconds).padStart(2,"0");


}



setInterval(updateCountdown,1000);

updateCountdown();




/*==============================
    PROGRESSION MAINTENANCE
==============================*/


let progress = 65;


const progressElement =
    document.getElementById("progressValue");


const progressBar =
    document.querySelector(".progress-fill");



function updateProgress(){


    if(progress < 100){

        progress += 1;


        progressElement.textContent =
            progress + "%";


        progressBar.style.width =
            progress + "%";

    }


}



setInterval(updateProgress,60000);




/*==============================
    MESSAGES AUTOMATIQUES
==============================*/


const messages = [

    "Nos serveurs sont actuellement en cours de mise à jour afin d'améliorer les performances et la sécurité.",

    "Installation des dernières améliorations techniques en cours.",

    "Optimisation de la plateforme pour une meilleure expérience utilisateur.",

    "Renforcement de la sécurité de nos services."

];


let messageIndex = 0;


const messageBox =
    document.getElementById("maintenanceMessage");



setInterval(()=>{


    messageIndex++;


    if(messageIndex >= messages.length){

        messageIndex = 0;

    }


    messageBox.style.opacity = 0;


    setTimeout(()=>{


        messageBox.textContent =
            messages[messageIndex];


        messageBox.style.opacity = 1;


    },500);



},10000);




/*==============================
    REFRESH BUTTON
==============================*/


const refreshBtn =
    document.getElementById("refreshBtn");



if(refreshBtn){


    refreshBtn.addEventListener(
        "click",
        ()=>{

            location.reload();

        }
    );

}




/*==============================
    YEAR FOOTER
==============================*/


const year =
    document.getElementById("year");


if(year){

    year.textContent =
        new Date().getFullYear();

}



/*==============================
    LOADER
==============================*/


window.addEventListener(
    "load",
    ()=>{

        const loader =
            document.querySelector(".page-loader");


        if(loader){

            setTimeout(()=>{

                loader.style.display="none";

            },2000);

        }

    }
);