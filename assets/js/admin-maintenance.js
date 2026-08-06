/* ==========================================
   ALFA IT SERVICES
   ADMIN MAINTENANCE JAVASCRIPT
========================================== */


/*==============================
    INITIALISATION
==============================*/


document.addEventListener(
    "DOMContentLoaded",
    async ()=>{

        await checkAdminAccess();

        await loadMaintenanceSettings();

        initPreview();

    }
);



/*==============================
    VARIABLES
==============================*/


let maintenanceId = null;


const statusBox =
document.getElementById("maintenanceStatus");


const titleInput =
document.getElementById("maintenanceTitle");


const messageInput =
document.getElementById("maintenanceMessage");


const progressInput =
document.getElementById("maintenanceProgress");


const dateInput =
document.getElementById("maintenanceDate");



/*==============================
    VERIFICATION ADMIN
==============================*/


async function checkAdminAccess(){


    const {
        data:{
            session
        }
    } = await supabase.auth.getSession();



    if(!session){


        window.location.href =
        "../login.html";

        return;

    }




    const {
        data:user,
        error
    } = await supabase

    .from("profiles")

    .select(
        "role,is_admin"
    )

    .eq(
        "id",
        session.user.id
    )

    .single();




    if(error ||
       !user ||
       user.role !== "super_admin"){



        alert(
        "Accès réservé au super administrateur"
        );


        window.location.href =
        "admin-dashboard.html";


        return;

    }



}




/*==============================
    CHARGER CONFIGURATION
==============================*/


async function loadMaintenanceSettings(){


    const {
        data,
        error
    } = await supabase

    .from("maintenance_settings")

    .select("*")

    .single();



    if(error){


        console.error(error);


        alert(
        "Erreur chargement maintenance"
        );


        return;

    }




    maintenanceId =
    data.id;



    titleInput.value =
    data.title || "";



    messageInput.value =
    data.message || "";



    progressInput.value =
    data.progress || 0;



    if(data.end_date){


        const date =
        new Date(data.end_date);



        dateInput.value =
        date.toISOString()
        .slice(0,16);

    }



    updateStatus(
    data.maintenance_active
    );


    updatePreview();



}




/*==============================
    STATUT
==============================*/


function updateStatus(active){



    if(active){


        statusBox.textContent =
        "Maintenance active";


        statusBox.className =
        "status offline";


    }
    else{


        statusBox.textContent =
        "Site en ligne";


        statusBox.className =
        "status online";


    }


}




/*==============================
    ACTIVER
==============================*/


document
.getElementById("activateMaintenance")
.addEventListener(
"click",
async ()=>{


    await updateMaintenanceStatus(true);


});




/*==============================
    DESACTIVER
==============================*/


document
.getElementById("disableMaintenance")
.addEventListener(
"click",
async ()=>{


    await updateMaintenanceStatus(false);


});






async function updateMaintenanceStatus(value){



    const {
        error
    } = await supabase

    .from("maintenance_settings")

    .update({

        maintenance_active:value,

        updated_at:
        new Date()

    })

    .eq(
        "id",
        maintenanceId
    );




    if(error){


        console.error(error);


        alert(
        "Erreur modification statut"
        );


        return;

    }




    updateStatus(value);



    alert(

        value ?

        "Maintenance activée"

        :

        "Maintenance désactivée"

    );


}







/*==============================
    SAUVEGARDE
==============================*/


document
.getElementById("saveMaintenance")
.addEventListener(
"click",
async ()=>{


    await saveMaintenance();


});




async function saveMaintenance(){



    const updateData = {


        title:
        titleInput.value,


        message:
        messageInput.value,


        progress:
        Number(
        progressInput.value
        ),


        updated_at:
        new Date()

    };



    if(dateInput.value){


        updateData.end_date =
        new Date(
        dateInput.value
        );


    }




    const {
        error
    } = await supabase

    .from("maintenance_settings")

    .update(updateData)

    .eq(
        "id",
        maintenanceId
    );




    if(error){


        console.error(error);


        alert(
        "Erreur sauvegarde"
        );


        return;

    }




    alert(
    "Configuration enregistrée"
    );



    updatePreview();



}






/*==============================
    APERCU DIRECT
==============================*/


function initPreview(){


    titleInput
    .addEventListener(
    "input",
    updatePreview
    );


    messageInput
    .addEventListener(
    "input",
    updatePreview
    );


    progressInput
    .addEventListener(
    "input",
    updatePreview
    );


}





function updatePreview(){



    const previewTitle =
    document.getElementById(
    "previewTitle"
    );



    const previewMessage =
    document.getElementById(
    "previewMessage"
    );



    const previewBar =
    document.getElementById(
    "previewBar"
    );



    const previewPercent =
    document.getElementById(
    "previewPercent"
    );



    if(previewTitle){


        previewTitle.textContent =
        titleInput.value;


    }




    if(previewMessage){


        previewMessage.textContent =
        messageInput.value;


    }




    if(previewBar){


        previewBar.style.width =
        progressInput.value + "%";


    }



    if(previewPercent){


        previewPercent.textContent =
        progressInput.value + "%";


    }


}