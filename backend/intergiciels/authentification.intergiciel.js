const { authenticate } = require('../middleware/auth.middleware');

// Adapter to older naming
exports.verifierAuth = (req, res, next) => authenticate(req, res, next);