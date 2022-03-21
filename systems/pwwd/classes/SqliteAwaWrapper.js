const sqlite3 = require("sqlite3").verbose();

class SqliteAwaWrapper{
  constructor({path,schema}) {
    this.path=path;
    this.schema = schema;
  }
  static getSqliteDatabase({path}){
    return new Promise(async (resolve, reject) => {
      const database = new sqlite3.Database(path, async err => {
        if (err) {
          console.log("err",err,path);
          return resolve({ err: err });
        } else {
          return resolve({ opened: database });
        }
      });
    });
  }
  static openSqliteDatabase({path}){
    return new Promise(async (resolve, reject) => {
      const database = new sqlite3.Database(path,sqlite3.OPEN_READWRITE,async err => {
          if (err) {
            return resolve({err:err});
          } else {
            return resolve({created:database});
          }
        }
      );
    });
  }
  static sqliteAddCustomTransactions({ transactions, database }){
    return new Promise((resolve, reject) => {
      let runEachQuery = (database, all_data, idx, callBack) => {
        if (all_data[idx]) {
          database.run(
            all_data[idx].query,
            all_data[idx].data,
            (err, success) => {
              if (err) {
                return callBack({ err: err.toString() });
              } else {
                runEachQuery(database, all_data, idx + 1, callBack);
              }
            }
          );
        } else {
          return callBack({ ok: true });
        }
      };
      database.serialize(() => {
        database.run("BEGIN");
        runEachQuery(database, transactions, 0, outcome => {
          if (outcome.ok) {
            database.run("commit");
            return resolve({ ok: true });
          } else {
            database.run("rollback");
            return resolve({ err: outcome.err });
          }
        });
      });
    });
  }
  static createConnection({path, schema}){
    return new Promise(async (resolve, reject) => {
      if (!schema) {
        throw Error (`cannot find database schema for path ${path}`);
        return resolve({ err: "schema is needed" });
      }
      if (!path) {
        throw Error (`cannot find path to database ${path}`);
        return resolve({ err: "path is needed" });
      }
      let database = await SqliteAwaWrapper.openSqliteDatabase({path});
      if (database.created) {
        return resolve(database.created);
      }
      database = await SqliteAwaWrapper.getSqliteDatabase({path});
      if (database.err) {
        console.log(database.err)
        return resolve({ err: database.err });
      }
      database = database.opened;
      let transactions = [];
      for (let elt in schema) {
        transactions.push({query:schema[elt]});
      }
      const outcome = await SqliteAwaWrapper.sqliteAddCustomTransactions({
        transactions,
        database
      });
      if(outcome.err){
        console.log(outcome.err );
        throw Error (`cannot create database ${path}`);
        return resolve({ err: outcome.err });
      } else {
        return resolve(database);
      }
    });
  }
  static closeSqliteDatabase(database){
    if (database) {
      database.close();
    }
  }
  static getConnection({path,schema}){
    return new Promise(async(resolve, reject)=>{
      let controller = new SqliteAwaWrapper({path,schema});
      let outcome = await controller.connect();
      if(outcome.error){
        return reject(outcome.error);
      }
      try {
        let foreignKey =  await controller.execute({query:`PRAGMA foreign_keys = ON`});
      } catch (e) {
        return reject(e.toString());
      }
      return resolve(controller);
    });
  }
  connect(){
    return new Promise(async(resolve, reject)=>{
      try {
         if(!this.conn){
          this.conn = await SqliteAwaWrapper.createConnection({path:this.path,schema:this.schema});
         }
         return resolve(this.conn);
      } catch (e) {
         return resolve({error:e});
      }
    });
  }
  transaction({transactions}){
    return new Promise(async(resolve, reject)=>{
      const outcome = await SqliteAwaWrapper.sqliteAddCustomTransactions({
        transactions,
        database:this.conn
      });
      if(outcome.err){
        return reject(outcome.err);
      } else {
        return resolve(outcome);
      }
    });
  }
  findOne({query,data}){
    return new Promise(async(resolve, reject)=>{
      const callBack = (err, row)=>{
        if (err){
            return reject(err);
        }
        return resolve(row);
      };
      if(data){
        this.conn.get(query, data,callBack);
      }else{
        this.conn.get(query,callBack);
      }
    });
  }
  findAll({query,data}){
    return new Promise((resolve, reject)=>{
      const callBack = (err, rows)=>{
        if (err){
            return reject(err);
        }
        return resolve(rows);
      };
      if(data){
        this.conn.all(query, data,callBack);
      }else{
        this.conn.all(query,callBack);
      }
    });
  }
  execute({query,data}){
    return new Promise((resolve, reject)=>{
      const callBack = (err, rows)=>{
        if (err){
            return reject(err);
        }
        return resolve({success:true});
      };
      if(data){
        this.conn.run(query, data,callBack);
      }else{
        this.conn.run(query,callBack);
      }
    });
  }
}
module.exports = SqliteAwaWrapper;
