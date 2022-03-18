const PathModule = require("path");
const AuthDatabaseInterface = require("../classes/AuthDatabaseInterface.js");
const SqliteAwaWrapper = require("../classes/SqliteAwaWrapper.js");
const sqlSchema = require("../schema/sqlite/users.js");
const { v4: uuidv4 } = require("uuid");
class SqliteAuthController extends AuthDatabaseInterface {
  constructor() {
    super();
  }
  buildSqlFilter({search}){
    let str = false;
    let data = [];
    if(Array.isArray(search)){
      for(let i =0; i< search.length; i++){
        let item  = search[i];
        let column = item[i].column, value = item[i].value;
        if("column" in item && "value" in item ){
          if(!str){
            str = `${item["column"]}=?`;
          }else{
            str += `AND ${item["column"]}=?`;
          }
          data.push(item["value"]);
        }
      }
    }else{
      if("column" in search && "value" in search ){
        if(!str){
          str = `${search["column"]}=?`;
        }else{
          str += `AND ${search["column"]}=?`;
        }
        data.push(search["value"]);
      }
    }
    return {str,data};
  }
  setConnection(conn){
    this.conn = conn;
  }
  _findUser({search}){
    return new Promise(async(resolve, reject)=>{
      let tmpFilter = this.buildSqlFilter({search});
      let filter = tmpFilter.str;
      let data = tmpFilter.data;
      let res = await this.conn.findOne({
        query:`SELECT * FROM users ${filter?`WHERE ${filter}`:""}`,
        data:data && data.length>0?data:false
      });
      if(res.err){
        return resolve({err:res.err});
      }else{
        return resolve({user:res.row});
      }
    });
  }
  _findUsers({search}){
    return new Promise(async(resolve, reject)=>{
      let tmpFilter = this.buildSqlFilter({search});
      let filter = tmpFilter.str;
      let data = tmpFilter.data;
      let res = await this.conn.findAll({
        query:`SELECT * FROM users ${filter?`WHERE ${filter}`:""}`,
        data:data && data.length>0?data:false
      });
      if(res.err){
        return resolve({err:res.err});
      }else{
        return resolve({users:res.rows});
      }
    });
  }
  _registerUser(args){
    return new Promise(async(resolve, reject)=>{
      if(!args.name){
          return resolve({ error: "name is missing"});
      }
      if(!args.email){
          return resolve({ error: "email is missing"});
      }
      if(!args.hash){
          return resolve({ error: "hash is missing"});
      }
      let id = uuidv4();
      let ts = new Date().getTime();
      let res = await this.conn.execute({
        query:`INSERT INTO users(id,email,name,password,ts,role) VALUES(?,?,?,?,?,?)`,
        data:[id,args.email,args.name,args.hash,ts,(args.role?args.role:0)]
      });
      if(res.err){
        return resolve({err:res.err});
      }else{
        return resolve({success:{
          id
        }});
      }
    });
  }
}
const Controller = new SqliteAuthController();
SqliteAwaWrapper.getConnection({
  path:PathModule.resolve(__dirname,`../databases/users.db`),
  schema:sqlSchema
}).then((conn)=>{
  Controller.setConnection(conn);
}).catch((err)=>{
    console.log(err);
});
module.exports = Controller;
