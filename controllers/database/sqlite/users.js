const sqliteConnController = require("./conn");
class UserController {
  constructor({path,schema}) {
    this.path = path;
    this.schema = schema;
  }
  makeid() {
    let text = "";
    let possible ="123456789";
    for (var i = 0; i < 12; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return parseInt(text);
  }
  init(){
    return new Promise(async(resolve, reject)=>{
      try {
         if(this.conn){
          return resolve({ok:true});
         }
         this.conn = await sqliteConnController.createConnection({path:this.path,schema:this.schema});
         return resolve({ok:true});
      } catch (e) {
         return resolve({error:e});
      }
    });
  }
  getUser(args){
    return new Promise((resolve, reject) => {
      this.conn.get('SELECT name,email,id FROM users WHERE username = ? AND password = ?', args.email, args.password, function(err, row) {
          if (!row){
              return resolve(null);
          }
          return resolve(row);
        });
    });
  }
  addUser(args){
    return new Promise((resolve, reject) => {
        if(!args.name){
            return resolve({ error: "name is missing"});
        }
        if(!args.email){
            return resolve({ error: "email is missing"});
        }
        if(!args.hash){
            return resolve({ error: "hash is missing"});
        }
        let id = this.makeid();
        let ts = new Date().getTime();
        this.conn.run(`INSERT INTO users(id,email,name,password,ts,role) VALUES(?,?,?,?,?,?)`,[id,args.email,args.name,args.hash,ts,(args.role?args.role:0)], function(err, row) {
            if (err){
                return reject(err);
            }
            return resolve({id:id});
          });
    });
}
chechEmail(args){
    return new Promise((resolve, reject) => {
        this.conn.get('SELECT * FROM users WHERE email = ?', args.email, function(err, row) {
            if (!row){
                return resolve(null);
            }
            if(row.id){
                return resolve(row);
            }else{
                return resolve(null);
            }
          });
    });
 }
 getUserById(args){
    return new Promise((resolve, reject) => {
        this.conn.get('SELECT * FROM users WHERE id = ?', args.id, function(err, row) {
            if (!row){
                return resolve(null);
            }
            if(row.id){
                return resolve(row);
            }else{
                return resolve(null);
            }
          });
    });
  }
}
module.exports = UserController;
