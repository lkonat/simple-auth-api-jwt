const {sqliteAuth} = require("../databases/auth.js");
const Controller = sqliteAuth;

function registerUser(args){
  return new Promise(async(resolve, reject)=>{
    let outcome = await Controller._registerUser(args);
    if(outcome.success){
      return resolve({success:outcome.success});
    }else{
      return reject(outcome.err?outcome.err:`could not register user`);
    }
  });
}

function findUser({search}){
  return new Promise(async(resolve, reject)=>{
    let outcome = await Controller._findUser({search});
    if(outcome.err){
      return reject(outcome.err);
    }else{
      return resolve({user:outcome.user});
    }
  });
}

function findUsers({search}){
  return new Promise(async(resolve, reject)=>{
      let outcome = await Controller.findUsers({search});
      if(outcome.err){
        return reject(outcome.err);
      }else{
        return resolve({users:outcome.users});
      }
  });

}

exports.registerUser= registerUser;
exports.findUser= findUser;
exports.findUsers= findUsers;
