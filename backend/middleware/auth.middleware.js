const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const tokenModel = require("../models/token.model");
const config = require("../config");


// =====================================================
// AUTHENTIFICATION JWT BACKEND
// =====================================================

const authenticate = async (req, res, next) => {

  try {


    // =====================================
    // RECUPERATION TOKEN
    // =====================================

    const header = req.headers.authorization;


    if (
      !header ||
      !header.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        error: "Token manquant"
      });

    }



    const token = header.split(" ")[1];



    if (!token) {

      return res.status(401).json({
        error: "Token invalide"
      });

    }





    // =====================================
    // VERIFICATION JWT
    // =====================================

    const payload = jwt.verify(
      token,
      config.jwt.secret
    );





    if (!payload) {

      return res.status(401).json({
        error: "Utilisateur non authentifié"
      });

    }





    // =====================================
    // VERIFICATION BLACKLIST TOKEN
    // =====================================

    const jti = payload.jti || null;



    if (jti) {


      const blacklisted =
      await tokenModel.isBlacklisted(jti);



      if (blacklisted) {

        return res.status(401).json({
          error:"Token révoqué"
        });

      }


    }





    // =====================================
    // CREATION SESSION USER
    // =====================================

    req.user = {

      id: payload.id,

      email: payload.email,

      role: payload.role || "client"

    };


    req.token = token;





    logger.info(
      "JWT authenticated : %s",
      req.user.email
    );





    next();



  } catch(err) {


    logger.warn(
      "JWT verify failed : %s",
      err.message
    );


    return res.status(401).json({

      error:
      "Token invalide ou expiré"

    });


  }


};





module.exports = {
  authenticate
};