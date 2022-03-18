const express = require('express');
const router = express.Router();
const { signup,signin,signout ,ensureAuth,ensureAdmin} = require("../controllers/auth.js");
const {userSignupValidator,userSigninValidator}  = require("../validator/index.js");
const {body} = require('express-validator');
router.post('/signup',
  body("name").not().isEmpty().trim().escape().withMessage('name missing'),
  body('email').isEmail().normalizeEmail().withMessage('incorrect email'),
  body('password').isLength({ min: 5 }).withMessage('passport must be at least 5 chars long'),
  body('password2').custom((value, { req }) => {
    if(!value){
      throw new Error('Password confirmation missing');
    }
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
  return true;
}),
  userSignupValidator,
  signup
);
router.post('/signin',
  body('email').isEmail().normalizeEmail().withMessage('incorrect email'),
  body("password").not().isEmpty().withMessage('password is missing'),
  userSigninValidator,
  signin
);

router.post('/signout',signout);

router.post('/hello',ensureAuth,(req,res)=>{
    res.json('hello');
});
router.post('/admin',ensureAuth,ensureAdmin,(req,res)=>{
    res.json('hello Admin');
});
router.get('/',ensureAuth,(req,res)=>{
    if(req.profile){
      const token = req.headers['x-auth-token'];
      const {email,name,role} =  req.profile;
      return res.json({token,user:{email,name,role}});
    }else {
      return res.status(403).json({error:"access denied"});
    }
});
module.exports = router;
