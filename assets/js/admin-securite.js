/* =====================================================
   ALFA IT SERVICES
   ADMIN SECURITY DASHBOARD
   JavaScript
===================================================== */


document.addEventListener("DOMContentLoaded", async () => {


console.log("🔒 Dashboard sécurité chargé");




// =====================================================
// VERIFICATION SESSION BACKEND JWT
// =====================================================


const token = localStorage.getItem("token");

const savedUser =
JSON.parse(localStorage.getItem("user"));



if(!token || !savedUser){


    console.error(
        "❌ Session backend introuvable"
    );


    window.location.href="../connexion.html";

    return;

}



console.log(
"Utilisateur :",
savedUser.email
);





// =====================================================
// VERIFICATION ROLE
// =====================================================


const role =
savedUser.role || "client";



if(
role !== "admin" &&
role !== "super_admin"

){


alert(
"Accès interdit"
);


window.location.href =
"dashboard.html";


return;


}



console.log(
"✅ Accès administrateur confirmé"
);





// =====================================================
// CONFIGURATION API
// =====================================================


const API_URL =
"http://localhost:5000/api";






// =====================================================
// ELEMENTS HTML
// =====================================================


const totalAlerts =
document.getElementById("totalAlerts");


const blockedIps =
document.getElementById("blockedIps");


const serverErrors =
document.getElementById("serverErrors");








// =====================================================
// REQUETE API SECURISEE
// =====================================================


async function apiRequest(endpoint){


try{


const token =
localStorage.getItem("token");



if(!token){


console.error(
"❌ Token backend introuvable"
);


return null;


}





const response =
await fetch(

`${API_URL}${endpoint}`,

{


method:"GET",


headers:{


"Authorization":
`Bearer ${token}`,


"Content-Type":
"application/json"


}


}

);






if(!response.ok){


console.error(
"API erreur :",
response.status
);


throw new Error(
"API erreur "+response.status
);


}





return await response.json();



}

catch(error){


console.error(
"Erreur API :",
error
);


return null;


}


}









// =====================================================
// ALERTES SECURITE
// =====================================================


async function loadAlerts(){



const tbody =
document.getElementById("alertsTable");


if(!tbody) return;



const data =
await apiRequest(
"/admin/security-alerts"
);




if(
!data ||
!data.alerts ||
data.alerts.length===0

){


tbody.innerHTML=`

<tr>
<td colspan="5">
Aucune alerte détectée
</td>
</tr>

`;

return;


}




tbody.innerHTML="";



data.alerts.forEach(alert=>{


tbody.innerHTML += `

<tr>

<td>
${alert.level || "Normal"}
</td>

<td>
${alert.type || "-"}
</td>

<td>
${alert.message || JSON.stringify(alert.payload || {})}
</td>

<td>
${new Date(alert.created_at)
.toLocaleString()}
</td>

<td>
Voir
</td>


</tr>

`;


});



if(totalAlerts)

totalAlerts.textContent =
data.alerts.length;



}










// =====================================================
// IP BLOQUEES
// =====================================================


async function loadBlockedIps(){


const tbody =
document.getElementById("blockedTable");


if(!tbody) return;



const data =
await apiRequest(
"/admin/blocked-ips"
);





if(
!data ||
!data.blocked ||
data.blocked.length===0

){


tbody.innerHTML=`

<tr>
<td colspan="4">
Aucune IP bloquée
</td>
</tr>

`;

return;


}




tbody.innerHTML="";



data.blocked.forEach(ip=>{


tbody.innerHTML += `

<tr>

<td>
${ip.ip}
</td>

<td>
${ip.reason || "-"}
</td>

<td>
${new Date(ip.blocked_at)
.toLocaleString()}
</td>

<td>
Bloquée
</td>


</tr>

`;


});



if(blockedIps)

blockedIps.textContent =
data.blocked.length;



}









// =====================================================
// ERREURS SYSTEME
// =====================================================


async function loadErrors(){


const tbody =
document.getElementById("errorsTable");


if(!tbody) return;



const data =
await apiRequest(
"/admin/errors"
);





if(
!data ||
!data.errors ||
data.errors.length===0

){


tbody.innerHTML=`

<tr>
<td colspan="3">
Aucune erreur
</td>
</tr>

`;

return;


}




tbody.innerHTML="";



data.errors.forEach(err=>{


tbody.innerHTML += `

<tr>

<td>
${err.code || "-"}
</td>


<td>
${err.message || "-"}
</td>


<td>
${new Date(err.created_at)
.toLocaleString()}
</td>


</tr>

`;


});



if(serverErrors)

serverErrors.textContent =
data.errors.length;



}









// =====================================================
// LOGS ADMIN
// =====================================================


async function loadLogs(){


const tbody =
document.getElementById("adminLogs");


if(!tbody) return;



const data =
await apiRequest(
"/admin/audit-logs"
);





if(
!data ||
!data.audits ||
data.audits.length===0

){


tbody.innerHTML=`

<tr>
<td colspan="3">
Aucun journal
</td>
</tr>

`;

return;


}




tbody.innerHTML="";



data.audits.forEach(log=>{


tbody.innerHTML += `

<tr>

<td>
${log.actor_email || "-"}
</td>

<td>
${log.action || "-"}
</td>

<td>
${new Date(log.created_at)
.toLocaleString()}
</td>

</tr>

`;


});


}









// =====================================================
// GRAPHIQUE ACTIVITE SECURITE (DONNEES REELLES)
// =====================================================

async function loadChart() {

    const canvas = document.getElementById("securityChart");

    if (!canvas) return;

    const data = await apiRequest("/admin/security/stats");

    if (!data) {
        console.error("Impossible de charger les statistiques.");
        return;
    }

    const labels = [];
    const values = [];

    // le backend renvoie normalement les 7 derniers jours
    data.stats.forEach(item => {

        labels.push(item.day);
        values.push(item.total);

    });

    new Chart(canvas, {

        type: "line",

        data: {

            labels,

            datasets: [{

                label: "Evènements de sécurité",

                data: values,

                borderColor: "#d4af37",

                backgroundColor: "rgba(212,175,55,0.15)",

                fill: true,

                tension: 0.35,

                pointRadius: 4,

                pointHoverRadius: 6

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}





// =====================================================
// DEMARRAGE
// =====================================================

await loadAlerts();
await loadBlockedIps();
await loadErrors();
await loadLogs();
await loadChart();


});