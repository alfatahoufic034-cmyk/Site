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
if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || !SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== 'string') {
  // Supabase not configured; export null client
  module.exports = null;
} else {
  // Clean and create
  const cleanUrl = SUPABASE_URL.trim();
  const supabase = createClient(cleanUrl, SUPABASE_ANON_KEY);
  module.exports = supabase;
}