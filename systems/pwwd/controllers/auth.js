const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
exports.ensureAuth=(req, res, next)=>{
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, async(err, user) => {
    if (err) return res.status(403).json({error:"access denied"});
    req.auth = user;
    next();
  });
}

exports.ensureAdmin = (req,res, next)=>{
  if(req.auth.role !== 1){
    return res.status(403).json({
      err:'Admin ressource! access denied'
    });
  }
  next();
};
