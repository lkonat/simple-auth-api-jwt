const sqlite3 = require("sqlite3").verbose();
function getSqliteDatabase({path}){
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
function openSqliteDatabase({path}){
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
function sqliteAddCustomTransactions({ transactions, database }){
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
function createConnection({path, schema}){
  return new Promise(async (resolve, reject) => {
    if (!schema) {
      throw Error (`cannot find database schema for path ${path}`);
      return resolve({ err: "schema is needed" });
    }
    if (!path) {
      throw Error (`cannot find path to database ${path}`);
      return resolve({ err: "path is needed" });
    }
    let database = await openSqliteDatabase({path});
    if (database.created) {
      return resolve(database.created);
    }
    database = await getSqliteDatabase({path});
    if (database.err) {
      throw Error (`cannot open database ${path}`);
      return resolve({ err: database.err });
    }
    database = database.opened;
    let transactions = [];
    for (let elt in schema) {
      transactions.push({query:schema[elt]});
    }
    const outcome = await sqliteAddCustomTransactions({
      transactions,
      database
    });
    if(outcome.err){
      throw Error (`cannot create database ${path}`);
      return resolve({ err: outcome.err });
    } else {
      return resolve(database);
    }
  });
}
function closeSqliteDatabase(database){
  if (database) {
    database.close();
  }
}
exports.createConnection = createConnection;
