const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be >= 8 chars'),
  body('name').optional().isString().trim().isLength({ min: 2 })
];

const loginValidator = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required')
];

module.exports = { registerValidator, loginValidator };
