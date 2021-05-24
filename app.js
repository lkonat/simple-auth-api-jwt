const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require('cors');
const numCpus = require("os").cpus().length;
require('dotenv').config();
app.use(cookieParser());
app.use(cors());
// Routes
var jsonParser = bodyParser.json();
app.use('/api/auth',jsonParser, require('./routes/auth.js'));
app.use((error, req, res, next)=>{
  if (error instanceof SyntaxError) {
    res.send({error:"SyntaxError Error"});
  } else {
    next();
  }
});
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${numCpus} cpu ${port}`);
});
