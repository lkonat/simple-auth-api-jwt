const {validationResult } = require('express-validator');
exports.userSignupValidator = (req,res,next)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  next();
}

exports.userSigninValidator = (req,res,next)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  next();
}
