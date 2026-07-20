const supabase = require('../database/supabaseClient');
const { logger } = require('../utils/logger');

if (!supabase) {
  logger.warn('Supabase not configured; supabase.service methods will be no-ops');
}

const createUser = async (user) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('users').insert([user]).select().single();
  if (error) throw error;
  return data;
};

const getUserByEmail = async (email) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1).single();
  if (error) return null;
  return data;
};

module.exports = { createUser, getUserByEmail };
