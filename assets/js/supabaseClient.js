// ========================================
// 🔐 CONFIGURATION SUPABASE
// ========================================

const SUPABASE_URL = "https://sgkmcvvgfdajopfvuazv.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNna21jdnZnZmRham9wZnZ1YXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjE0OTIsImV4cCI6MjA5MTk5NzQ5Mn0.m8sNHz9XXAjlAFgZ5a-15tm-tOHEs80oGdm1TVpNnL8";


// ========================================
// 🚨 VÉRIFICATION SDK SUPABASE
// ========================================

if (typeof supabase === "undefined") {
  console.error("❌ Supabase SDK non chargé (CDN manquant)");
} else {
  console.log("✅ Supabase SDK chargé");
}


// ========================================
// 🚀 INITIALISATION CLIENT
// ========================================

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// exposer globalement
window.supabaseClient = supabaseClient;

console.log("✅ Supabase connecté avec succès");


// ========================================
// ⏳ ATTENTE SÉCURISÉE (IMPORTANT AJOUT)
// ========================================

async function waitSupabaseReady() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.supabaseClient) {
        resolve(window.supabaseClient);
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

window.waitSupabaseReady = waitSupabaseReady;


// ========================================
// 👤 UTILISATEUR ACTUEL
// ========================================

async function getCurrentUser() {
  try {
    await waitSupabaseReady();

    const { data: { user }, error } =
      await supabaseClient.auth.getUser();

    if (error) {
      console.error("❌ getUser error :", error.message);
      return null;
    }

    return user || null;

  } catch (err) {
    console.error("❌ getCurrentUser error :", err.message);
    return null;
  }
}

window.getCurrentUser = getCurrentUser;


// ========================================
// 📌 SESSION
// ========================================

async function getCurrentSession() {
  try {
    await waitSupabaseReady();

    const { data: { session }, error } =
      await supabaseClient.auth.getSession();

    if (error) {
      console.error("❌ getSession error :", error.message);
      return null;
    }

    return session || null;

  } catch (err) {
    console.error("❌ getCurrentSession error :", err.message);
    return null;
  }
}

window.getCurrentSession = getCurrentSession;


// ========================================
// 🔐 ADMIN CHECK
// ========================================

async function isCurrentUserAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("❌ admin check error :", error.message);
      return false;
    }

    return data?.is_admin === true;

  } catch (err) {
    console.error("❌ admin check crash :", err.message);
    return false;
  }
}

window.isCurrentUserAdmin = isCurrentUserAdmin;


// ========================================
// 🔓 LOGOUT
// ========================================

async function logoutUser() {
  try {
    await waitSupabaseReady();

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("❌ logout error :", error.message);
      return;
    }

    console.log("✅ Déconnexion OK");
    window.location.href = "../auth/login.html";

  } catch (err) {
    console.error("❌ logout crash :", err.message);
  }
}

window.logoutUser = logoutUser;


// ========================================
// 🔄 REDIRECTION LOGIN
// ========================================

async function redirectAfterLogin() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      window.location.href = "../auth/login.html";
      return;
    }

    const isAdmin = await isCurrentUserAdmin();

    window.location.href = isAdmin
      ? "../admin/dashboard.html"
      : "../client/dashboard.html";

  } catch (err) {
    console.error("❌ redirect error :", err.message);
    window.location.href = "../auth/login.html";
  }
}

window.redirectAfterLogin = redirectAfterLogin;


// ========================================
// 🔄 LISTENER AUTH
// ========================================

supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("🔄 Auth event :", event);

  if (event === "SIGNED_IN") {
    console.log("✅ connecté");
  }

  if (event === "SIGNED_OUT") {
    console.log("👋 déconnecté");
  }

  if (event === "INITIAL_SESSION") {
    console.log("📌 session OK");
  }

  if (event === "TOKEN_REFRESHED") {
    console.log("🔄 token refresh");
  }
});