const sqliteController = require("../controllers/database/sqlite/users");
const path = require("path");
class UserModel {
  constructor({controller}) {
    this.controller = controller;
    this.controller.init();
  }
  getUser(args){
    return this.controller.getUser(args);
  }
  addUser(args){
    return this.controller.addUser(args);
  }
  chechEmail(args){
    return this.controller.chechEmail(args);
  }
  getUserById(args){
    return this.controller.getUserById(args);
  }
}
const model = new UserModel({
  controller:new sqliteController({path:path.resolve(`./databases/users.db`),schema: require("../schema/sqlite/users.js")})
});
module.exports = model;
