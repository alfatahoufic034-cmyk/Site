const { createClient } =
require("@supabase/supabase-js");

require("dotenv").config();

// ============================
// 🔐 ENV VARIABLES
// ============================
const SUPABASE_URL =
process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
process.env.SUPABASE_ANON_KEY;

// ============================
// 🚨 VALIDATION STRICTE
// ============================
if (
  !SUPABASE_URL ||
  typeof SUPABASE_URL !== "string"
) {
  throw new Error(
    "❌ SUPABASE_URL is missing or invalid in .env"
  );
}

if (
  !SUPABASE_ANON_KEY ||
  typeof SUPABASE_ANON_KEY !== "string"
) {
  throw new Error(
    "❌ SUPABASE_ANON_KEY is missing or invalid in .env"
  );
}

// ============================
// 🚀 CLEAN URL (évite erreurs format)
// ============================
const cleanUrl =
SUPABASE_URL.trim();

// ============================
// 🚀 CREATE SUPABASE CLIENT
// ============================
const supabase =
createClient(
  cleanUrl,
  SUPABASE_ANON_KEY
);

// ============================
// 📤 EXPORT
// ============================
module.exports = supabase;