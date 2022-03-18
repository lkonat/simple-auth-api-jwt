const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require('cors');
const numCpus = require("os").cpus().length;
const PathModule = require("path");
require('dotenv').config();
app.use(cookieParser());
app.use(cors());
// Routes
var jsonParser = bodyParser.json();
// app.use('/api/auth',jsonParser, require('./routes/auth.js'));
app.use("/assets",express.static('./public/assets'));
app.use('/api/auth',jsonParser, require('./systems/auth/routes/auth.js'));
app.use('/api/app',jsonParser, require('./systems/pwwd/routes'));
app.get("/*", (req, res)=>{
  res.sendFile(PathModule.join(__dirname,"public/assets/index.html"));
});
app.use((error, req, res, next)=>{
  if (error instanceof SyntaxError) {
    res.send({error:"SyntaxError Error"});
  } else {
    next();
  }
});
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port} cpu ${numCpus}`);
});
