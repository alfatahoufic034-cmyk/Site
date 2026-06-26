const contactService = require("../services/contact.service");

// ============================
// 📩 ENVOYER MESSAGE
// ============================
exports.sendMessage = async (req, res) => {
  try {
    const data = await contactService.sendMessage(req.body);

    return res.status(201).json({
      message: "Message envoyé avec succès",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// 📥 GET MESSAGES (ADMIN)
// ============================
exports.getMessages = async (req, res) => {
  try {
    const data = await contactService.getAllMessages();

    return res.status(200).json({
      message: "Liste des messages",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// ❌ DELETE MESSAGE
// ============================
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await contactService.deleteMessage(id);

    return res.status(200).json({
      message: "Message supprimé"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};