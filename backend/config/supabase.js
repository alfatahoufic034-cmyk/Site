// ========================================
// 🔥 SUPABASE BACKEND CONFIG
// ========================================

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ========================================
// 🔐 VARIABLES ENV
// ========================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ========================================
// 🚀 CRÉATION CLIENT SUPABASE
// ========================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 📤 EXPORT
// ========================================

module.exports = supabase;