const PathModule = require("path");
const DatabaseInterface = require("../classes/databaseInterface.js");
const SqliteAwaWrapper = require("../classes/SqliteAwaWrapper.js");
const sqlSchema = require("../schema/sqlite/space.js");
const { v4: uuidv4 } = require("uuid");
class Controller extends DatabaseInterface {
  constructor() {
    super();
  }
  setConnection(conn){
    this.conn = conn;
  }
  _createSpace({userId,spaceName}){
    return new Promise(async(resolve, reject)=>{
      let transactions = [];
      const spaceId = uuidv4();
      const ts = new Date().getTime();
      transactions.push({
        query:`INSERT INTO spaces(space_id,ts) VALUES(?,?)`,
        data:[spaceId,ts]
      });
      const memberShipId = uuidv4();
      transactions.push({
        query:`INSERT INTO space_members(member_id,user_id,space_id,ts,space_name) VALUES(?,?,?,?,?)`,
        data:[memberShipId,userId,spaceId,ts,spaceName]
      });

      try {
        let res = await this.conn.transaction({transactions});
        return resolve(res);
      } catch (e) {
        return reject(e);
      }
    });
  }
  _getSpaces({userId}){
    return new Promise(async(resolve, reject)=>{
      if(!userId){
        return reject("user not authenticated");
      }
      try {
        let rows = await this.conn.findAll({
          query:`SELECT * FROM spaces AS S JOIN space_members AS M ON S.space_id = M.space_id WHERE M.user_id = ?`,
          data:[userId]
        });
        return resolve({spaces:rows});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _createFolder({inFolderId,folderName,spaceId,userId}){
    return new Promise(async(resolve, reject)=>{
      if(!userId){
        return reject("user not authenticated");
      }
      if(!spaceId){
        return reject("require spaceId");
      }
      if(!folderName){
        return reject("require folder name");
      }
      let transactions =[];
      const itemId = uuidv4();
      transactions.push({
        query:`INSERT INTO items(item_id,parent_id,space_id,name,type) VALUES(?,?,?,?,?)`,
        data:[itemId,inFolderId?inFolderId:null,spaceId,folderName,"folder"]
      });
      transactions.push({
        query:`INSERT INTO folders(folder_id,item_id) VALUES(?,?)`,
        data:[itemId,itemId]
      });
      try {
        let res = await this.conn.transaction({transactions});
        console.log(res);
        return resolve(res);
      } catch (e) {
        return reject(e);
      }
    });
  }
  _createFlashcard({inFolderId,cardName,spaceId,userId}){
    return new Promise(async(resolve, reject)=>{
      if(!userId){
        return reject("user not authenticated");
      }
      if(!spaceId){
        return reject("require spaceId");
      }
      if(!cardName){
        return reject("require folder name");
      }
      let transactions =[];
      const itemId = uuidv4();
      transactions.push({
        query:`INSERT INTO items(item_id,parent_id,space_id,name,type) VALUES(?,?,?,?,?)`,
        data:[itemId,inFolderId?inFolderId:null,spaceId,cardName,"flashcard"]
      });
      transactions.push({
        query:`INSERT INTO flashcards(flashcard_id,item_id) VALUES(?,?)`,
        data:[itemId,itemId]
      });
      try {
        let res = await this.conn.transaction({transactions});
        console.log(res);
        return resolve(res);
      } catch (e) {
        return reject(e);
      }
    });
  }
  _getSpaceItems({spaceId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!spaceId){
          return reject("require spaceId");
        }
        try {
          let rows = await this.conn.findAll({
            query:`SELECT * FROM items WHERE space_id=? AND parent_id IS NULL`,
            data:[spaceId]
          });
          return resolve({items:rows});
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getFlashcardCards({flashcardId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!flashcardId){
          return reject("require flashcard id");
        }
        try {
          let rows = await this.conn.findAll({
            query:`SELECT * FROM cards WHERE flashcard_id=? ORDER BY pos ASC`,
            data:[flashcardId]
          });
          return resolve({cards:rows});
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getFolderItems({folderId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!folderId){
          return reject("require id");
        }
        try {
          let rows = await this.conn.findAll({
            query:`SELECT * FROM items WHERE parent_id=?`,
            data:[folderId]
          });
          return resolve({items:rows});
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _addCardToFlashcard({flashcardId,cardTitle,cardType,userId}){
    return new Promise(async(resolve, reject)=>{
      if(!userId){
        return reject("user not authenticated");
      }
      if(!flashcardId){
        return reject("require card id");
      }
      if(!cardTitle || cardTitle?.length<=0){
        return reject("require card title");
      }
      let transactions =[];
      const cardId = uuidv4();
      cardType = cardType?cardType:"basic";
      const cardObj = {
        id:cardId,
        flashcard_id:flashcardId,
        title:cardTitle,
        type:cardType
      };
      transactions.push({
        query:`INSERT INTO cards(card_id,flashcard_id,title,type) VALUES(?,?,?,?)`,
        data:[cardObj.id,cardObj.flashcard_id,cardObj.title,cardObj.type]
      });
      if(cardType==="basic"){
        transactions.push({
          query:`INSERT INTO basicCards(basic_card_id,card_id,text) VALUES(?,?,?)`,
          data:[cardObj.id,cardObj.id,".."]
        });
      }else{
        return reject("card type is unknown");
      }
      try {
        let res = await this.conn.transaction({transactions});
        if(res.ok){
          return resolve({card:cardObj});
        }
        return resolve(res);
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getCard({cardId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!cardId){
          return reject("require card id");
        }
        //find card
        try {
          let data = {};
          let item = await this.conn.findOne({query:`SELECT * FROM cards WHERE card_id=?`,data:[cardId]});
          if(item?.card_id){
            data={...item};
            if(item?.type==="basic"){
              let card = await this.conn.findOne({
                query:`SELECT * FROM basicCards WHERE card_id=?`,
                data:[cardId]
              });
              if(card){
                data={...data,...card};
              }
              return resolve(data);
            }else{
              return reject("unknown card type");
            }
          }else{
            return resolve(data);
          }
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getItemContent({itemId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!itemId){
          return reject("require item id");
        }
        try {
          let data = {};
          let item = await this.conn.findOne({query:`SELECT * FROM items WHERE item_id=?`,data:[itemId]});
          if(item.item_id){
            data={...item};
            if(item?.type === "flashcard"){
              try {
                let content = await this._getFlashcardCards({flashcardId:item.item_id,userId});
                return resolve(content);
              } catch (e) {
                return reject(e.toString());
              }
            }else if(item?.type === "folder"){
              try {
                let content = await this._getFolderItems({folderId:item.item_id,userId});
                return resolve(content);
              } catch (e) {
                return reject(e.toString());
              }
            }else{
              return reject("unknown card type");
            }
          }else{
            return resolve(data);
          }
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
}
const controller = new Controller();
SqliteAwaWrapper.getConnection({
  path:PathModule.resolve(__dirname,`../databases/space.db`),
  schema:sqlSchema
}).then((conn)=>{
  controller.setConnection(conn);
}).catch((err)=>{
    console.log(err);
});
module.exports = controller;
