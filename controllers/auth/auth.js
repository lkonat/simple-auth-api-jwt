const Model = require("../../models/users");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
exports.signin = async(req,res)=>{
  const {email, password} = req.body;
  const user = await Model.chechEmail({email:email});
  if(!user){
    return res.status(400).json({error:"incorrect credentials"});
  }
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err){
      return res.status(400).json({error:err.toString()});
    }
    const {id,email,name,role} = user;
    if (isMatch) {
      const token = jwt.sign({id:id,role:role},process.env.JWT_SECRET,{
        algorithm: "HS256",
        expiresIn: 60*60,
      });
      //return response to user and frontend client
      return res.json({token, user:{id,email,name}});
    } else {
      return res.status(400).json({error:"password does not match"});
    }
  });
};

exports.signup = async(req,res)=>{
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (errors.length > 0) {
    res.status(400).json({
        errors:errors,
        name:name,
        email:email,
        password:password,
        password2:password2
    });
  } else {
    const user = await Model.chechEmail({email:email});
    if (user) {
      errors.push({ msg: 'Email already exists' });
      res.status(400).json({
        errors:errors,
        name:name,
        email:email,
        password:password,
        password2:password2
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          Model.addUser({
              name:name,
              email:email,
              hash:hash
          }).then(user => {
              res.json({registered:true});
          }).catch((err )=>{
              res.status(400).json({error:err});
          });
        });
      });
    }
  }
};

exports.signout = (req,res)=>{
  res.clearCookie("awa-token");
  res.json({message:"sign out successfull"});
}


exports.ensureAuth=(req, res, next)=>{
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, async(err, user) => {
    if (err) return res.status(403).json({error:"access denied"});
    req.auth = user;
    const profile = await Model.getUserById({id:user.id});
    if(!profile){
      return res.status(403).json({error:"access denied"});
    }
    const {id,email,name,ts,role} = profile;
    req.profile = {id,email,name,ts,role};
    next();
  });
}

exports.ensureAdmin = (req,res, next)=>{
  if(req.profile.role !== 1){
    return res.status(403).json({
      err:'Admin ressource! access denied'
    });
  }
  next();
};
