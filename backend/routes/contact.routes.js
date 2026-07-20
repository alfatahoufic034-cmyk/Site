const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { body } = require('express-validator');

const validator = [ body('email').isEmail(), body('message').isLength({ min: 5 }) ];

router.post('/', validator, contactController.sendContact);

module.exports = router;
const supabase = require("../config/supabase");

// ============================
// 📩 ENVOYER MESSAGE CONTACT
// ============================
exports.sendMessage = async (data) => {
  try {
    const { name, email, message } = data;

    const { data: result, error } = await supabase
      .from("contacts")
      .insert([
        {
          name,
          email,
          message
        }
      ])
      .select();

    if (error) throw error;

    return result;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// 📥 LISTE MESSAGES
// ============================
exports.getAllMessages = async () => {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// ❌ SUPPRIMER MESSAGE
// ============================
exports.deleteMessage = async (id) => {
  try {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;

  } catch (err) {
    throw new Error(err.message);
  }
};