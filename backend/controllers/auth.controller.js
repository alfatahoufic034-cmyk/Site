const authService = require("../services/auth.service");
const { genererToken } = require("../utils/jeton");

// REGISTER
exports.register = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis"
      });
    }

    const data = await authService.registerUser(
      email,
      password
    );

    return res.status(201).json({
      message: "Compte créé avec succès",
      user: data.user
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message
    });

  }
};

// LOGIN
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis"
      });
    }

    const data = await authService.loginUser(
      email,
      password
    );

    const token = genererToken(data.user);

    return res.status(200).json({
      message: "Connexion réussie",
      user: data.user,
      token
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message
    });

  }
};