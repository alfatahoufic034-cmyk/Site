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



const failedLogins =
document.getElementById("failedLogins");

const criticalThreats =
document.getElementById("criticalThreats");

const lastSecurityCheck =
document.getElementById("lastSecurityCheck");

const securityMonitoring =
document.getElementById("securityMonitoring");

const securityDataStatus =
document.getElementById("securityDataStatus");

const securityActivity =
document.getElementById("securityActivity");

const loginAttemptsTable =
document.getElementById("loginAttemptsTable");

const refreshSecurityBtn =
document.getElementById("refreshSecurityBtn");

const testEmergencySoundBtn =
    document.getElementById("testEmergencySoundBtn");





    // =====================================================
// NOUVEAUX ELEMENTS - SURVEILLANCE
// =====================================================

// Utilisateurs connectés
const activeUsersTable =
    document.getElementById("activeUsersTable");

// Trafic API
const apiRequests =
    document.getElementById("apiRequests");

const apiSuccess =
    document.getElementById("apiSuccess");

const apiClientErrors =
    document.getElementById("apiClientErrors");

const apiServerErrors =
    document.getElementById("apiServerErrors");

// Etat des services
const nodeStatus =
    document.getElementById("nodeStatus");

const apiStatus =
    document.getElementById("apiStatus");

const supabaseStatus =
    document.getElementById("supabaseStatus");

const smtpStatus =
    document.getElementById("smtpStatus");

const storageStatus =
    document.getElementById("storageStatus");

// Statuts HTTP
const http2xx =
    document.getElementById("http2xx");

const http4xx =
    document.getElementById("http4xx");

const http5xx =
    document.getElementById("http5xx");

const http429 =
    document.getElementById("http429");

// Sécurité des fichiers
const uploadedFiles =
    document.getElementById("uploadedFiles");

const rejectedFiles =
    document.getElementById("rejectedFiles");

const suspiciousFiles =
    document.getElementById("suspiciousFiles");

const fileSecurityTable =
    document.getElementById("fileSecurityTable");

// Sauvegardes
const lastBackup =
    document.getElementById("lastBackup");

const backupStatus =
    document.getElementById("backupStatus");

const nextBackup =
    document.getElementById("nextBackup");

const backupSize =
    document.getElementById("backupSize");




// =====================================================
// SON D'URGENCE SECURITE
// =====================================================

const emergencyAlertSound =
    new Audio("../assets/sounds/security-alert.mp3");

emergencyAlertSound.preload = "auto";

emergencyAlertSound.volume = 1.0;


// Fonction pour jouer le son d'urgence
function playEmergencyAlertSound() {

    try {

        emergencyAlertSound.currentTime = 0;

        emergencyAlertSound.play()
            .then(() => {

                console.log(
                    "🚨 Son d'urgence de sécurité déclenché"
                );

            })
            .catch(error => {

                console.warn(
                    "⚠️ Lecture du son bloquée par le navigateur :",
                    error
                );

            });

    }
    catch (error) {

        console.error(
            "❌ Erreur du son d'urgence :",
            error
        );

    }

}




// =====================================================
// NOTIFICATION D'URGENCE
// =====================================================

const securityEmergencyAlert =
document.getElementById("securityEmergencyAlert");

const securityEmergencyMessage =
document.getElementById("securityEmergencyMessage");

const securityEmergencyTime =
document.getElementById("securityEmergencyTime");

const closeEmergencyAlert =
document.getElementById("closeEmergencyAlert");








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
// MODALE DETAILS ALERTE
// =====================================================

function showAlertDetails(alert) {

    const modal =
        document.getElementById("alertDetailsModal");

    if (!modal) return;

    const level =
        document.getElementById("detailAlertLevel");

    const type =
        document.getElementById("detailAlertType");

    const message =
        document.getElementById("detailAlertMessage");

    const ip =
        document.getElementById("detailAlertIp");

    const user =
        document.getElementById("detailAlertUser");

    const date =
        document.getElementById("detailAlertDate");

    const action =
        document.getElementById("detailAlertAction");

    const technical =
        document.getElementById("detailAlertTechnical");


    if (level) {
        level.textContent =
            alert.level || "--";
    }

    if (type) {
        type.textContent =
            alert.type || "--";
    }

    if (message) {
        message.textContent =
            alert.message || "--";
    }

    if (ip) {
        ip.textContent =
            alert.ip_address ||
            alert.ip_adress ||
            "--";
    }

    if (user) {
        user.textContent =
            alert.user_email ||
            alert.email ||
            alert.user_id ||
            "--";
    }

    if (date) {
        date.textContent =
            formatThreatDate(alert.created_at);
    }

    if (action) {
        action.textContent =
            alert.action ||
            (alert.blocked ? "Bloquée" : "Autorisée");
    }

    if (technical) {

        technical.textContent =
            alert.payload
                ? JSON.stringify(
                    alert.payload,
                    null,
                    2
                )
                : "--";

    }


    modal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );

}


// =====================================================
// FERMER MODALE DETAILS ALERTE
// =====================================================

function closeAlertDetails() {

    const modal =
        document.getElementById(
            "alertDetailsModal"
        );

    if (!modal) return;

    modal.hidden = true;

    document.body.classList.remove(
        "modal-open"
    );

}


// Bouton X
const closeAlertDetailsButton =
    document.getElementById(
        "closeAlertDetails"
    );

if (closeAlertDetailsButton) {

    closeAlertDetailsButton.addEventListener(
        "click",
        closeAlertDetails
    );

}


// Bouton Fermer
const closeAlertDetailsBtn =
    document.getElementById(
        "closeAlertDetailsBtn"
    );

if (closeAlertDetailsBtn) {

    closeAlertDetailsBtn.addEventListener(
        "click",
        closeAlertDetails
    );

}


// Fermer en cliquant sur l'overlay
const alertDetailsModal =
    document.getElementById(
        "alertDetailsModal"
    );

if (alertDetailsModal) {

    alertDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "alert-details-overlay"
                )
            ) {

                closeAlertDetails();

            }

        }
    );

}


// Fermer avec la touche Échap
document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeAlertDetails();

        }

    }
);






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



data.alerts.forEach(alert => {

    showEmergencyNotification(alert);


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
// AFFICHER UNE NOTIFICATION D'URGENCE
// =====================================================

function showEmergencyNotification(alert) {

    if (!securityEmergencyAlert) return;

    const level =
        String(alert.level || "")
        .toLowerCase()
        .trim();

    const isCritical =
        level === "critical" ||
        level === "critique" ||
        level === "high" ||
        level === "élevé" ||
        level === "eleve";

    if (!isCritical) return;


    const type =
        alert.type || "Activité suspecte";

    const message =
        alert.message || "Une menace de sécurité a été détectée.";

    const ip =
        alert.ip_address || alert.ip_adress || null;


    let finalMessage =
        `${type} : ${message}`;


    if (ip) {

        finalMessage +=
            ` | IP : ${ip}`;

    }


    securityEmergencyMessage.textContent =
        finalMessage;


    securityEmergencyTime.textContent =
    `Détectée le ${formatThreatDate(alert.created_at)}`;

// Afficher la notification
securityEmergencyAlert.hidden = false;

// Jouer le son d'urgence
playEmergencyAlertSound();
}




// =====================================================
// FERMER LA NOTIFICATION D'URGENCE
// =====================================================

if (closeEmergencyAlert) {

    closeEmergencyAlert.addEventListener(
        "click",
        () => {

            if (securityEmergencyAlert) {

                securityEmergencyAlert.hidden = true;

            }

        }
    );

}



// =====================================================
// CONNEXIONS ECHOUEES
// =====================================================

async function loadFailedLogins() {

    if (!failedLogins) return;

    try {

        const data = await apiRequest(
            "/admin/login-attempts"
        );

        console.log(
            "🔐 Tentatives de connexion :",
            data
        );

        let attempts = [];

        if (Array.isArray(data)) {

            attempts = data;

        } else if (
            data &&
            Array.isArray(data.attempts)
        ) {

            attempts = data.attempts;

        } else if (
            data &&
            Array.isArray(data.login_attempts)
        ) {

            attempts = data.login_attempts;

        }

        const failed = attempts.filter(
            attempt =>
                attempt.success === false ||
                attempt.success === "false"
        );

        failedLogins.textContent =
            failed.length;

    }
    catch (error) {

        console.error(
            "❌ Erreur connexions échouées :",
            error
        );

        failedLogins.textContent = "0";

    }

}



// =====================================================
// MENACES CRITIQUES
// =====================================================

async function loadCriticalThreats() {

    if (!criticalThreats) return;

    try {

        const data = await apiRequest(
            "/admin/security-threats"
        );

        const threats =
            data && Array.isArray(data.threats)
                ? data.threats
                : [];

        const critical =
            threats.filter(threat => {

                const level =
                    String(
                        threat.level || ""
                    )
                    .toLowerCase()
                    .trim();

                return (
                    level === "critical" ||
                    level === "critique"
                );

            });

        criticalThreats.textContent =
            critical.length;

    }
    catch (error) {

        console.error(
            "❌ Erreur menaces critiques :",
            error
        );

        criticalThreats.textContent = "0";

    }

}



// =====================================================
// DERNIERE VERIFICATION
// =====================================================

function updateSecurityCheckTime() {

    if (!lastSecurityCheck) return;

    const now = new Date();

    lastSecurityCheck.textContent =
        now.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}



// =====================================================
// ACTIVITE RECENTE
// =====================================================

async function loadSecurityActivity() {

    if (!securityActivity) return;

    securityActivity.innerHTML = `
        <div class="activity-empty">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Chargement de l'activité...

        </div>
    `;

    try {

        const data =
            await apiRequest(
                "/admin/security-threats"
            );

        const threats =
            data && Array.isArray(data.threats)
                ? data.threats
                : [];

        if (threats.length === 0) {

            securityActivity.innerHTML = `
                <div class="activity-empty">

                    <i class="fa-solid fa-shield-halved"></i>

                    Aucune activité récente

                </div>
            `;

            return;

        }

        const recentThreats =
            [...threats]
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            )
            .slice(0, 5);


        securityActivity.innerHTML = "";


        recentThreats.forEach(threat => {

            const risk =
                getThreatRisk(
                    threat.level
                );

            const action =
                getThreatAction(
                    threat.action,
                    threat.blocked
                );


            const item =
                document.createElement("div");

            item.className =
                "security-activity-item";


            item.innerHTML = `

                <div class="activity-icon ${risk.class}">

                    <i class="fa-solid fa-shield-virus"></i>

                </div>


                <div class="activity-content">

                    <strong>
                        ${escapeThreatHTML(
                            threat.type ||
                            "Événement de sécurité"
                        )}
                    </strong>

                    <span>
                        IP :
                        ${escapeThreatHTML(
                            threat.ip_address || "-"
                        )}
                    </span>

                </div>


                <div class="activity-meta">

                    <span class="action-badge ${action.class}">
                        ${action.label}
                    </span>

                    <small>
                        ${formatThreatDate(
                            threat.created_at
                        )}
                    </small>

                </div>

            `;


            securityActivity.appendChild(item);

        });

    }
    catch (error) {

        console.error(
            "❌ Erreur activité récente :",
            error
        );

        securityActivity.innerHTML = `
            <div class="activity-empty error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Impossible de charger l'activité

            </div>
        `;

    }

}




// =====================================================
// MENACES DE SECURITE
// =====================================================

async function loadThreats() {

    const tbody = document.getElementById("threatsTable");

    if (!tbody) return;

    // Message de chargement
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Chargement des menaces...
            </td>
        </tr>
    `;

    try {

        const data = await apiRequest(
            "/admin/security-threats"
        );

        console.log("🛡️ Menaces reçues :", data);


        if (
            !data ||
            !data.threats ||
            data.threats.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fa-solid fa-shield-halved"></i>
                        Aucune menace détectée
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML = "";


        data.threats.forEach(threat => {

            const risk = getThreatRisk(
                threat.level
            );


            const action = getThreatAction(
                threat.action,
                threat.blocked
            );


            const attempts =
                Number(threat.attempts || 0);


            const row = document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeThreatHTML(
                            threat.type || "Inconnue"
                        )}
                    </strong>
                </td>


                <td>
                    <span class="threat-location">
                        ${threat.country
                            ? `${threat.flag || "🌍"} ${escapeThreatHTML(threat.country)}`
                            : "🌍 Inconnue"
                        }
                    </span>
                </td>


                <td>
                    <code>
                        ${escapeThreatHTML(
                            threat.ip_address || "-"
                        )}
                    </code>
                </td>


                <td>
                    ${formatThreatDate(
                        threat.created_at
                    )}
                </td>


                <td>
                    <span class="risk-badge ${risk.class}">
                        ${risk.label}
                    </span>
                </td>


                <td>
                    <span class="action-badge ${action.class}">
                        ${action.label}
                    </span>
                </td>


                <td>
                    <strong>
                        ${attempts}
                    </strong>
                </td>


                <td>
                    <button
                        type="button"
                        class="threat-details-btn"
                        data-threat-id="${escapeThreatHTML(
                            threat.id || ""
                        )}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>

            `;


            // Bouton détails
            const detailsButton =
                row.querySelector(
                    ".threat-details-btn"
                );


            if (detailsButton) {

                detailsButton.addEventListener(
                    "click",
                    () => {

                        showThreatDetails(threat);

                    }
                );

            }


            tbody.appendChild(row);

        });


    }
    catch (error) {

        console.error(
            "❌ Erreur chargement menaces :",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Erreur lors du chargement des menaces
                </td>
            </tr>
        `;

    }

}




// =====================================================
// NIVEAU DE RISQUE
// =====================================================

function getThreatRisk(level) {

    const value =
        String(level || "").toLowerCase().trim();


    if (
        value === "critical" ||
        value === "critique"
    ) {

        return {
            label: "🔴 Critique",
            class: "critical"
        };

    }


    if (
        value === "high" ||
        value === "élevé" ||
        value === "eleve"
    ) {

        return {
            label: "🟠 Élevé",
            class: "high"
        };

    }


    if (
        value === "medium" ||
        value === "moyen"
    ) {

        return {
            label: "🟡 Moyen",
            class: "medium"
        };

    }


    return {
        label: "🟢 Faible",
        class: "low"
    };

}



// =====================================================
// ACTION DE LA MENACE
// =====================================================

function getThreatAction(action, blocked) {

    if (blocked === true) {

        return {
            label: "🚫 Bloquée",
            class: "blocked"
        };

    }


    const value =
        String(action || "").toLowerCase();


    if (
        value.includes("prevent") ||
        value.includes("prévenu") ||
        value.includes("prevenu")
    ) {

        return {
            label: "⚠️ Prévenue",
            class: "prevented"
        };

    }


    return {
        label: "🟢 Autorisée",
        class: "allowed"
    };

}



// =====================================================
// FORMAT DATE MENACE
// =====================================================

function formatThreatDate(date) {

    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (Number.isNaN(parsedDate.getTime())) {

        return "-";

    }


    return parsedDate.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}




// =====================================================
// SECURISATION AFFICHAGE HTML
// =====================================================

function escapeThreatHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// DETAILS D'UNE MENACE
// =====================================================

function showThreatDetails(threat) {

    const existingModal =
        document.getElementById("threatDetailsModal");


    if (existingModal) {

        existingModal.remove();

    }


    const risk =
        getThreatRisk(threat.level);


    const action =
        getThreatAction(
            threat.action,
            threat.blocked
        );


    const modal =
        document.createElement("div");


    modal.id =
        "threatDetailsModal";


    modal.className =
        "threat-details-modal";


    modal.innerHTML = `

        <div class="threat-details-box">

            <div class="threat-details-header">

                <div>

                    <i class="fa-solid fa-shield-virus"></i>

                    <h3>
                        Détails de la menace
                    </h3>

                </div>


                <button
                    type="button"
                    class="close-threat-modal"
                    id="closeThreatModal">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div class="threat-details-content">

                <div class="detail-item">

                    <strong>
                        🛡️ Type
                    </strong>

                    <span>
                        ${escapeThreatHTML(
                            threat.type || "-"
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        🌐 Adresse IP
                    </strong>

                    <code>
                        ${escapeThreatHTML(
                            threat.ip_address || "-"
                        )}
                    </code>

                </div>


                <div class="detail-item">

                    <strong>
                        🌍 Localisation
                    </strong>

                    <span>
                        ${threat.country
                            ? `${threat.flag || "🌍"} ${escapeThreatHTML(threat.country)}`
                            : "Inconnue"
                        }
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        ⚠️ Niveau
                    </strong>

                    <span class="risk-badge ${risk.class}">
                        ${risk.label}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        🔒 Action
                    </strong>

                    <span class="action-badge ${action.class}">
                        ${action.label}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        📊 Tentatives
                    </strong>

                    <span>
                        ${Number(threat.attempts || 0)}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        📅 Date
                    </strong>

                    <span>
                        ${formatThreatDate(
                            threat.created_at
                        )}
                    </span>

                </div>


                <div class="detail-message">

                    <strong>
                        🔎 Détails de la menace
                    </strong>

                    <p>
                        ${escapeThreatHTML(
                            threat.message || "Aucun détail disponible."
                        )}
                    </p>

                </div>

            </div>


            <div class="threat-details-footer">

                <button
                    type="button"
                    id="closeThreatModalBtn">

                    Fermer

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeThreatModal")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById("closeThreatModalBtn")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                modal.remove();

            }

        }
    );

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
// MONITORING SYSTEME
// =====================================================
async function loadSystemStats() {

    try {

        const res = await fetch(
            `${API_URL}/system/stats`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );

        if (!res.ok) {
            throw new Error(
                `Erreur serveur : ${res.status}`
            );
        }

        const data = await res.json();

        // CPU
        const cpuElement =
            document.getElementById("cpuUsage");

        if (cpuElement && data.cpu) {
            cpuElement.textContent =
                `${data.cpu.usage}%`;
        }

        // RAM
        const ramElement =
            document.getElementById("ramUsage");

        if (ramElement && data.ram) {
            ramElement.textContent =
                `${data.ram.usage}%`;
        }

        const ramDetail =
            document.getElementById("ramDetail");

        if (ramDetail && data.ram) {
            ramDetail.textContent =
                `${data.ram.used} Go / ${data.ram.total} Go`;
        }

        // DISQUE
        const diskElement =
            document.getElementById("diskUsage");

        if (diskElement && data.disk) {
            diskElement.textContent =
                `${data.disk.used}%`;
        }

        // UPTIME
        const uptimeElement =
            document.getElementById("uptime");

        if (
            uptimeElement &&
            data.uptime &&
            typeof data.uptime.seconds === "number"
        ) {

            const hours =
                Math.floor(
                    data.uptime.seconds / 3600
                );

            uptimeElement.textContent =
                `${hours} heures`;
        }

    }
    catch (error) {

        console.error(
            "❌ Erreur monitoring système :",
            error
        );

    }

}



loadSystemStats();



setInterval(
loadSystemStats,
10000
);



// =====================================================
// TENTATIVES DE CONNEXION
// =====================================================

async function loadLoginAttempts() {

    if (!loginAttemptsTable) return;

    loginAttemptsTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Chargement...
            </td>
        </tr>
    `;

    try {

        const data =
            await apiRequest(
                "/admin/login-attempts"
            );

        let attempts = [];

        if (
            data &&
            Array.isArray(data.attempts)
        ) {

            attempts = data.attempts;

        }
        else if (
            data &&
            Array.isArray(data.login_attempts)
        ) {

            attempts = data.login_attempts;

        }
        else if (Array.isArray(data)) {

            attempts = data;

        }


        if (attempts.length === 0) {

            loginAttemptsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        Aucune tentative enregistrée
                    </td>
                </tr>
            `;

            return;

        }


        loginAttemptsTable.innerHTML = "";


        attempts.slice(0, 20).forEach(attempt => {

            const success =
                attempt.success === true ||
                attempt.success === "true";


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeThreatHTML(
                        attempt.email || "-"
                    )}
                </td>

                <td>
                    <code>
                        ${escapeThreatHTML(
                            attempt.ip_address || "-"
                        )}
                    </code>
                </td>

                <td>
                    ${escapeThreatHTML(
                        attempt.user_agent || "-"
                    )}
                </td>

                <td>
                    <span class="action-badge ${
                        success
                            ? "allowed"
                            : "blocked"
                    }">
                        ${
                            success
                                ? "🟢 Réussie"
                                : "🔴 Échouée"
                        }
                    </span>
                </td>

                <td>
                    ${escapeThreatHTML(
                        attempt.reason || "-"
                    )}
                </td>

                <td>
                    ${formatThreatDate(
                        attempt.created_at
                    )}
                </td>

            `;


            loginAttemptsTable.appendChild(row);

        });

    }
    catch (error) {

        console.error(
            "❌ Erreur login_attempts :",
            error
        );

        loginAttemptsTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state error">
                    Impossible de charger les tentatives
                </td>
            </tr>
        `;

    }

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
// UTILISATEURS ACTUELLEMENT CONNECTÉS
// =====================================================

async function loadActiveUsers() {

    if (!activeUsersTable) return;

    activeUsersTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Chargement des utilisateurs...
            </td>
        </tr>
    `;

    try {

        const data =
            await apiRequest("/admin/security/active-users");

        const users =
            data && Array.isArray(data.users)
                ? data.users
                : [];

        if (users.length === 0) {

            activeUsersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fa-solid fa-users-slash"></i>
                        Aucun utilisateur actuellement connecté
                    </td>
                </tr>
            `;

            return;
        }

        activeUsersTable.innerHTML = "";

        users.forEach(user => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${escapeThreatHTML(
                        user.email || "-"
                    )}
                </td>

                <td>
                    ${escapeThreatHTML(
                        user.role || "client"
                    )}
                </td>

                <td>
                    <code>
                        ${escapeThreatHTML(
                            user.ip_address || "-"
                        )}
                    </code>
                </td>

                <td>
                    ${escapeThreatHTML(
                        user.user_agent || "-"
                    )}
                </td>

                <td>
                    ${formatThreatDate(
                        user.login_at
                    )}
                </td>

                <td>
                    ${formatThreatDate(
                        user.last_activity
                    )}
                </td>

                <td>
                    <span class="user-status">
                        En ligne
                    </span>
                </td>

            `;

            activeUsersTable.appendChild(row);

        });

    }
    catch (error) {

        console.error(
            "❌ Erreur utilisateurs connectés :",
            error
        );

        activeUsersTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state error">
                    Impossible de charger les utilisateurs
                </td>
            </tr>
        `;

    }

}



// =====================================================
// TRAFIC API
// =====================================================

async function loadApiTraffic() {

    try {

        const data =
            await apiRequest(
                "/admin/security/api-traffic"
            );

        if (!data) return;

        if (apiRequests) {

            apiRequests.textContent =
                Number(data.total || 0);

        }

        if (apiSuccess) {

            apiSuccess.textContent =
                Number(data.success || 0);

        }

        if (apiClientErrors) {

            apiClientErrors.textContent =
                Number(data.client_errors || 0);

        }

        if (apiServerErrors) {

            apiServerErrors.textContent =
                Number(data.server_errors || 0);

        }

        if (http2xx) {

            http2xx.textContent =
                Number(data.http_2xx || 0);

        }

        if (http4xx) {

            http4xx.textContent =
                Number(data.http_4xx || 0);

        }

        if (http5xx) {

            http5xx.textContent =
                Number(data.http_5xx || 0);

        }

        if (http429) {

            http429.textContent =
                Number(data.http_429 || 0);

        }

    }
    catch (error) {

        console.error(
            "❌ Erreur trafic API :",
            error
        );

    }

}



// =====================================================
// ETAT DES SERVICES
// =====================================================

async function loadServiceStatus() {

    try {

        const data =
            await apiRequest(
                "/admin/security/services"
            );

        if (!data) return;


        updateServiceStatus(
            nodeStatus,
            data.node,
            "Node.js"
        );


        updateServiceStatus(
            apiStatus,
            data.api,
            "API Express"
        );


        updateServiceStatus(
            supabaseStatus,
            data.supabase,
            "Supabase"
        );


        updateServiceStatus(
            smtpStatus,
            data.smtp,
            "SMTP"
        );


        updateServiceStatus(
            storageStatus,
            data.storage,
            "Storage"
        );

    }
    catch (error) {

        console.error(
            "❌ Erreur état des services :",
            error
        );

    }

}



// =====================================================
// AFFICHAGE ETAT SERVICE
// =====================================================

function updateServiceStatus(
    element,
    status,
    serviceName
) {

    if (!element) return;

    const isOnline =
        status === true ||
        status === "true" ||
        status === "online" ||
        status === "connected" ||
        status === "ok";

    element.classList.remove(
        "status-online",
        "status-offline",
        "status-checking"
    );

    if (isOnline) {

        element.textContent = "Opérationnel";

        element.classList.add(
            "status-online"
        );

    }
    else {

        element.textContent = "Indisponible";

        element.classList.add(
            "status-offline"
        );

    }

}



// =====================================================
// SECURITE DES FICHIERS
// =====================================================

async function loadFileSecurity() {

    if (!fileSecurityTable) return;

    try {

        const data =
            await apiRequest(
                "/admin/security/uploads"
            );

        if (!data) return;


        if (uploadedFiles) {

            uploadedFiles.textContent =
                Number(data.total || 0);

        }


        if (rejectedFiles) {

            rejectedFiles.textContent =
                Number(data.rejected || 0);

        }


        if (suspiciousFiles) {

            suspiciousFiles.textContent =
                Number(data.suspicious || 0);

        }


        const files =
            Array.isArray(data.files)
                ? data.files
                : [];


        if (files.length === 0) {

            fileSecurityTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        Aucun fichier récent
                    </td>
                </tr>
            `;

            return;

        }


        fileSecurityTable.innerHTML = "";


        files.slice(0, 20).forEach(file => {

            const result =
                String(
                    file.result || "safe"
                ).toLowerCase();


            let resultClass =
                "file-safe";

            let resultLabel =
                "Sûr";


            if (
                result === "suspicious" ||
                result === "suspect"
            ) {

                resultClass =
                    "file-warning";

                resultLabel =
                    "Suspect";

            }


            if (
                result === "rejected" ||
                result === "blocked" ||
                result === "danger"
            ) {

                resultClass =
                    "file-danger";

                resultLabel =
                    "Refusé";

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeThreatHTML(
                        file.name || "-"
                    )}
                </td>

                <td>
                    ${escapeThreatHTML(
                        file.user_email || "-"
                    )}
                </td>

                <td>
                    ${escapeThreatHTML(
                        file.type || "-"
                    )}
                </td>

                <td>
                    ${escapeThreatHTML(
                        file.size || "-"
                    )}
                </td>

                <td>
                    ${formatThreatDate(
                        file.created_at
                    )}
                </td>

                <td>
                    <span class="${resultClass}">
                        ${resultLabel}
                    </span>
                </td>

            `;


            fileSecurityTable.appendChild(row);

        });

    }
    catch (error) {

        console.error(
            "❌ Erreur sécurité fichiers :",
            error
        );

    }

}



// =====================================================
// SAUVEGARDES
// =====================================================

async function loadBackupStatus() {

    try {

        const data =
            await apiRequest(
                "/admin/security/backups"
            );

        if (!data) return;


        if (lastBackup) {

            lastBackup.textContent =
                data.last_backup || "--";

        }


        if (backupStatus) {

            backupStatus.textContent =
                data.status || "Inconnu";

        }


        if (nextBackup) {

            nextBackup.textContent =
                data.next_backup || "--";

        }


        if (backupSize) {

            backupSize.textContent =
                data.size || "--";

        }

    }
    catch (error) {

        console.error(
            "❌ Erreur sauvegardes :",
            error
        );

    }

}




// =====================================================
// ETAT DE LA SURVEILLANCE
// =====================================================

function updateSecurityStatus(connected = true) {

    if (securityMonitoring) {

        securityMonitoring.textContent =
            connected ? "Actif" : "Dégradé";

    }

    if (securityDataStatus) {

        securityDataStatus.textContent =
            connected ? "Connecté" : "Indisponible";

    }

}


// =====================================================
// RAFRAICHISSEMENT GLOBAL
// =====================================================

async function refreshSecurityDashboard() {

    console.log(
        "🔄 Actualisation du centre de sécurité..."
    );


    if (refreshSecurityBtn) {

        refreshSecurityBtn.disabled = true;

        refreshSecurityBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Actualisation...
        `;

    }


    try {

        await Promise.all([

    loadAlerts(),
    loadBlockedIps(),
    loadErrors(),
    loadLogs(),
    loadThreats(),
    loadFailedLogins(),
    loadCriticalThreats(),
    loadSecurityActivity(),
    loadLoginAttempts(),

    loadActiveUsers(),
    loadApiTraffic(),
    loadServiceStatus(),
    loadFileSecurity(),
    loadBackupStatus(),
    loadSystemStats()

]);



        updateSecurityCheckTime();

        updateSecurityStatus(true);


        console.log(
            "✅ Centre de sécurité actualisé"
        );

    }
    catch (error) {

        console.error(
            "❌ Erreur actualisation :",
            error
        );

        updateSecurityStatus(false);

    }
    finally {

        if (refreshSecurityBtn) {

            refreshSecurityBtn.disabled = false;

            refreshSecurityBtn.innerHTML = `
                <i class="fa-solid fa-arrows-rotate"></i>
                Actualiser
            `;

        }

    }

}


// =====================================================
// BOUTON ACTUALISER
// =====================================================

if (refreshSecurityBtn) {

    refreshSecurityBtn.addEventListener(
        "click",
        refreshSecurityDashboard
    );

}



// =====================================================
// TEST DU SON D'URGENCE
// =====================================================

if (testEmergencySoundBtn) {

    testEmergencySoundBtn.addEventListener(
        "click",
        () => {

            playEmergencyAlertSound();

        }
    );

}




// =====================================================
// DEMARRAGE
// =====================================================

await loadAlerts();

await loadBlockedIps();

await loadErrors();

await loadLogs();

await loadChart();

await loadThreats();

await loadFailedLogins();

await loadCriticalThreats();

await loadSecurityActivity();

await loadLoginAttempts();


// =====================================================
// NOUVELLES SURVEILLANCES
// =====================================================

await loadActiveUsers();

await loadApiTraffic();

await loadServiceStatus();

await loadFileSecurity();

await loadBackupStatus();


// =====================================================
// ETAT GENERAL
// =====================================================

updateSecurityCheckTime();

updateSecurityStatus(true);

});