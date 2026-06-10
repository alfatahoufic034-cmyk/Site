const supabase = require("../config/supabase");

// ============================
// REGISTER
// ============================
exports.registerUser = async (email, password) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ============================
// LOGIN
// ============================
exports.loginUser = async (email, password) => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};