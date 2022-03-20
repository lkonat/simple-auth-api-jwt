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
  _constructItem({spaceId,parentId,userId,items,type}){
    return new Promise(async(resolve, reject)=>{
      function buildTransactions(items,parentId,spaceId,userId){
        return new Promise((resolve, reject)=>{
          let records = [];
          for(let i =0; i<items.length; i++){
            let item = items[i];
            let record = {
              ...item,
              item_id: uuidv4(),
              space_id:spaceId,
              item_name:item.item_name,
              item_type:item.item_type,
              item_ts:new Date().getTime(),
              item_owner:userId,
              parent_id:parentId?parentId:null
            };
            console.log(record);
            if(!record.item_id){
              return reject("could not create item id");
            }
            if(!record.space_id){
              return reject("require space id");
            }
            if(!record.item_name){
              return reject("require item name");
            }
            if(!record.item_type){
              return reject("require item type");
            }
            if(!record.item_owner){
              return reject("could get user id");
            }
            records.push(record);
          }
          return resolve(records);
        });
      }
      try {
        let newItems = false;
        let typeRules = DatabaseInterface.typeRules;
        if(!typeRules){
          return reject("type rule is missing");
        }
        if(!items || !Array.isArray(items)){
          return reject("require items as an array");
        }
        if(parentId){
          try {
            let parent = await this.conn.findOne({query:`SELECT * FROM items WHERE item_id=?`,data:[parentId]});
            let parentType = parent?.item_type;
            let parentHostRule = typeRules[parentType];
            let canBeAddedToParent = type && parentHostRule && (parentHostRule.canHost ==="*" || type in parentHostRule.canHost)? true:false;
            if(canBeAddedToParent){
              newItems = buildTransactions(items,parentId,spaceId,userId);
            }else{
              return reject("cannot be added to target");
            }
          } catch (e) {
            return reject(`cannot be added to target ${e.toString()}`);
          }
        }else{
          newItems = buildTransactions(items,parentId,spaceId,userId);
        }
        if(newItems){
          return resolve(newItems);
        }else{
          return reject("could not construct item");
        }
      } catch (e) {
        return reject(`something went wrong while creating item ${e.toString()}`);
      }
    });
  }
  _getFolderItemTransaction({spaceId,parentId,userId,items}){
    return new Promise(async(resolve, reject)=>{
      try {
        let itemType = "folder";
        items = items.map((a)=>{ a.item_type =itemType; return a});
        let newItems = false;
        try {
          newItems = await this._constructItem({items:items,spaceId,parentId,userId,items,type:itemType});
        } catch (e) {
          return reject(e);
        }
        if(!newItems){
          return reject("could construct items");
        }
        let transactions =[];
        for(let i =0; i< newItems.length; i++){
          let item = newItems[i];
          let itemQ= {
            query:`INSERT INTO items(item_id,parent_id,space_id,item_name,item_type,item_ts,item_owner) VALUES(?,?,?,?,?,?,?)`,
            data:[item.item_id,item.parent_id,item.space_id,item.item_name,item.item_type,item.item_ts,item.item_owner]
          };
          let folderQ= {
            query:`INSERT INTO folders(item_id) VALUES(?)`,
            data:[item.item_id]
          };
          transactions.push(itemQ,folderQ);
        }
        return resolve({transactions:transactions,items:newItems});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getFlashcardItemTransaction({spaceId,parentId,userId,items}){
    return new Promise(async(resolve, reject)=>{
      try {
        let itemType = "flashcard";
        items = items.map((a)=>{ a.item_type =itemType; return a});
        let newItems = false;
        try {
          newItems = await this._constructItem({items:items,spaceId,parentId,userId,items,type:itemType});
        } catch (e) {
          return reject(e);
        }
        if(!newItems){
          return reject("could construct items");
        }
        let transactions =[];
        for(let i =0; i< newItems.length; i++){
          let item = newItems[i];
          let itemQ= {
            query:`INSERT INTO items(item_id,parent_id,space_id,item_name,item_type,item_ts,item_owner) VALUES(?,?,?,?,?,?,?)`,
            data:[item.item_id,item.parent_id,item.space_id,item.item_name,item.item_type,item.item_ts,item.item_owner]
          };
          let folderQ= {
            query:`INSERT INTO flashcards(item_id) VALUES(?)`,
            data:[item.item_id]
          };
          transactions.push(itemQ,folderQ);
        }
        return resolve({transactions:transactions,items:newItems});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  _getflashcardCardItemTransaction({spaceId,parentId,userId,items}){ //handle in case of multiple cards
    return new Promise(async(resolve, reject)=>{
      try {
        let itemType = "flashcard_card";
        items = items.map((a)=>{ a.item_type =itemType; return a});
        let newItems = false;
        try {
          newItems = await this._constructItem({items:items,spaceId,parentId,userId,items,type:itemType});
        } catch (e) {
          return reject(e);
        }
        if(!newItems){
          return reject("could construct items");
        }
        let transactions =[];
        for(let i =0; i< newItems.length; i++){
          let item = newItems[i];
          if(!item.card_type){
            return reject("card type is required");
          }
          let itemQ= {
            query:`INSERT INTO items(item_id,parent_id,space_id,item_name,item_type,item_ts,item_owner) VALUES(?,?,?,?,?,?,?)`,
            data:[item.item_id,item.parent_id,item.space_id,item.item_name,item.item_type,item.item_ts,item.item_owner]
          };
          transactions.push(itemQ);
          let folderQ= {
            query:`INSERT INTO flashcard_cards(item_id,card_type) VALUES(?,?)`,
            data:[item.item_id,item.card_type]
          };
          transactions.push(folderQ);
          if(item.card_type==="basic"){
            if(!item.text){
              return reject("text is required");
            }
            let basicCardQ= {
              query:`INSERT INTO basic_cards(item_id,text) VALUES(?,?)`,
              data:[item.item_id,item.text]
            };
            transactions.push(basicCardQ);
          }else{
            return reject("unknown card type");
          }
        }
        return resolve({transactions:transactions,items:newItems});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }

  _addItemToSpace({userId,spaceId,parentId,folder,flashcard,flashcardCard }){
    return new Promise(async(resolve, reject)=>{
      try {
        let transactions =false;
        let newItems = false;
        let itemTransaction = false;
        let newItem = false;
        if(folder){
          let items =Array.isArray(folder)?folder:[folder];
          let tmp = await this._getFolderItemTransaction({spaceId,parentId,userId,items});
          if(tmp.transactions){
            transactions = tmp.transactions;
            newItems = tmp.items;
          }else{
            return reject("could not create item");
          }
        }else if (flashcard) {
          let items =Array.isArray(flashcard)?flashcard:[flashcard];
          let tmp = await this._getFlashcardItemTransaction({spaceId,parentId,userId,items});
          if(tmp.transactions){
            transactions = tmp.transactions;
            newItems = tmp.items;
          }else{
            return reject("could not create item");
          }
        }else if (flashcardCard) {
          let items =Array.isArray(flashcardCard)?flashcardCard:[flashcardCard];
          let tmp = await this._getflashcardCardItemTransaction({spaceId,parentId,userId,items});
          if(tmp.transactions){
            transactions = tmp.transactions;
            newItems = tmp.items;
          }else{
            return reject("could not create item");
          }
        }else{
          return reject("missing information");
        }
        if(!transactions){
          return reject("could not get transaction");
        }
        try {
          let res = await this.conn.transaction({transactions});
          return resolve({items:newItems});
        } catch (e) {
          return reject(e);
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
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
        query:`INSERT INTO space_members(member_id,user_id,space_id,membership_ts,space_name) VALUES(?,?,?,?,?)`,
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
  // _createFolder({inFolderId,folderName,spaceId,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     if(!userId){
  //       return reject("user not authenticated");
  //     }
  //     if(!spaceId){
  //       return reject("require spaceId");
  //     }
  //     if(!folderName){
  //       return reject("require folder name");
  //     }
  //     let transactions =[];
  //     const itemId = uuidv4();
  //     transactions.push({
  //       query:`INSERT INTO items(item_id,parent_id,space_id,name,type) VALUES(?,?,?,?,?)`,
  //       data:[itemId,inFolderId?inFolderId:null,spaceId,folderName,"folder"]
  //     });
  //     transactions.push({
  //       query:`INSERT INTO folders(folder_id,item_id) VALUES(?,?)`,
  //       data:[itemId,itemId]
  //     });
  //     try {
  //       let res = await this.conn.transaction({transactions});
  //       console.log(res);
  //       return resolve(res);
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }
  // _createFlashcard({inFolderId,cardName,spaceId,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     if(!userId){
  //       return reject("user not authenticated");
  //     }
  //     if(!spaceId){
  //       return reject("require spaceId");
  //     }
  //     if(!cardName){
  //       return reject("require folder name");
  //     }
  //     let transactions =[];
  //     const itemId = uuidv4();
  //     transactions.push({
  //       query:`INSERT INTO items(item_id,parent_id,space_id,name,type) VALUES(?,?,?,?,?)`,
  //       data:[itemId,inFolderId?inFolderId:null,spaceId,cardName,"flashcard"]
  //     });
  //     transactions.push({
  //       query:`INSERT INTO flashcards(flashcard_id,item_id) VALUES(?,?)`,
  //       data:[itemId,itemId]
  //     });
  //     try {
  //       let res = await this.conn.transaction({transactions});
  //       console.log(res);
  //       return resolve(res);
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }
  // _updateCard({cardId,cardType,changes,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     if(!userId){
  //       return reject("user not authenticated");
  //     }
  //     if(!cardId){
  //       return reject("require id");
  //     }
  //     if(!changes){
  //       return reject("require changes");
  //     }
  //     if(!cardType){
  //       return reject("require type");
  //     }
  //     let transactions =[];
  //     if(changes.title){
  //       transactions.push({
  //         query:`UPDATE cards SET title=? WHERE card_id=?`,
  //         data:[changes.title,cardId]
  //       });
  //     }
  //     if(cardType==="basic"){
  //       transactions.push({
  //         query:`UPDATE basicCards SET text=? WHERE card_id=?`,
  //         data:[changes.text,cardId]
  //       });
  //     }
  //     if(transactions.length>0){
  //       try {
  //         let res = await this.conn.transaction({transactions});
  //         return resolve(res);
  //       } catch (e) {
  //         return reject(e);
  //       }
  //     }else{
  //       return reject("no updates");
  //     }
  //   });
  // }


  #updateBasicFlashCard({item,changes}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!item?.item_id){
          return reject("require item id");
        }
        if(!changes){
          return reject("require changes object");
        }
        let transactions = [];
        let itemId = item.item_id;
        if(changes.item_name){
          let uppdate1 = {
            query:`UPDATE items SET item_name =? WHERE item_id=?`,
            data:[changes.item_name,itemId]
          }
          transactions.push(uppdate1);
        }
        if(("pos" in changes) || ("score" in changes)){
          let tmp = [];
          if(("pos" in changes)){
            tmp.push({action:"set",key:"pos", value:changes.pos});
          }
          if(("score" in changes)){
            tmp.push({action:"set",key:"score", value:changes.score});
          }
          tmp.push({action:"where",key:"item_id", value:itemId});
          let where = tmp.filter((x)=>{return x.action?.toLowerCase()==="where"});
          let set = tmp.filter((x)=>{return x.action?.toLowerCase()==="set"});
          let setStr = set.map((x)=>{ return `${x.key}=?`}).join(",");
          let setData = set.map((x)=>{ return x.value;});
          let whereStr = where.map((x)=>{ return `${x.key}=?`}).join(",");
          let whereData = where.map((x)=>{ return x.value});
          let allData = setData.concat(whereData);
          let uppdate2 = {
            query:`UPDATE flashcard_cards SET ${setStr} WHERE ${whereStr}`,
            data:allData
          };
          transactions.push(uppdate2);
        }
        if("text" in changes){
          let uppdate3 = {
            query:`UPDATE basic_cards SET text=? WHERE item_id=?`,
            data:[changes.text,itemId]
          };
          transactions.push(uppdate3);
        }
        if(!transactions || transactions?.length<=0){
          return reject("could not build transaction");
        }
        return resolve({transactions});
        // try {
        //   let res = await this.conn.transaction({transactions});
        //   return resolve({changes});
        // } catch (e) {
        //   return reject(e);
        // }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  #updateFlashcardCard({item,changes}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!item?.item_id){
          return reject("require item id");
        }
        if(!changes){
          return reject("require changes object");
        }
        let card = await this.conn.findOne({query:`SELECT * FROM flashcard_cards WHERE item_id=?`,data:[item.item_id]});
        if(card?.card_type==="basic"){
          try {
            let outcome = await this.#updateBasicFlashCard({item,changes});
            return resolve(outcome);
          } catch (e) {
            return reject(e.toString());
          }
        }else{
          return reject("unkown card type");
        }
      } catch (e) {
        return reject(e.toString());
      }
    });
  }
  #updateFolder({item,changes}){
    return new Promise(async(resolve, reject)=>{
      try {
        let transactions = [];
        if(!item?.item_id){
          return reject("require item id");
        }
        if(!changes){
          return reject("require changes object");
        }
        if(changes.item_name){
          let uppdate1 = {
            query:`UPDATE items SET item_name =? WHERE item_id=?`,
            data:[changes.item_name,item.item_id]
          }
          transactions.push(uppdate1);
        }
        if(!transactions || transactions?.length<=0){
          return reject("could not build transaction");
        }
        return resolve({transactions});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }

  #updateFlashcard({item,changes}){
    return new Promise(async(resolve, reject)=>{
      try {
        let transactions = [];
        if(!item?.item_id){
          return reject("require item id");
        }
        if(!changes){
          return reject("require changes object");
        }
        if(changes.item_name){
          let uppdate1 = {
            query:`UPDATE items SET item_name =? WHERE item_id=?`,
            data:[changes.item_name,item.item_id]
          }
          transactions.push(uppdate1);
        }
        if(!transactions || transactions?.length<=0){
          return reject("could not build transaction");
        }
        return resolve({transactions});
      } catch (e) {
        return reject(e.toString());
      }
    });
  }

  _updateItem({spaceId,itemId,changes,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!userId){
          return reject("user not authenticated");
        }
        if(!spaceId){
          return reject("require space id");
        }
        if(!changes){
          return reject("require changes");
        }
        if(!itemId){
          return reject("require item id");
        }
        try {
          let transactions = [];
          let item = await this.conn.findOne({query:`SELECT * FROM items WHERE item_id=? AND space_id=?`,data:[itemId,spaceId]});
          if(item.item_id){
            if(item.item_type ==="flashcard_card"){
              try {
                let outcome = await this.#updateFlashcardCard({item,changes});
                return resolve(outcome);
              } catch (e) {
                return reject(e.toString());
              }
            }else if (item.item_type ==="flashcard") {
              try {
                let outcome = await this.#updateFlashcard({item,changes});
                return resolve(outcome);
              } catch (e) {
                return reject(e.toString());
              }
            }else if (item.item_type ==="folder") {
              try {
                let outcome = await this.#updateFolder({item,changes});
                return resolve(outcome);
              } catch (e) {
                return reject(e.toString());
              }
            }else{
              return reject("unknown item type");
            }
          }else{
              return reject("item does not exist");
          }
        } catch (e) {
          return reject(e.toString());
        }
      } catch (e) {
        return reject(e.toString());
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
  _getItemChilds({spaceId,itemId,userId}){
    return new Promise(async(resolve, reject)=>{
      try {
        if(!itemId){
          return reject("require item id");
        }
        if(!spaceId){
          return reject("require space id");
        }
        if(!userId){
          return reject("require user id");
        }
        try {
          let rows = await this.conn.findAll({
            query:`SELECT * FROM items WHERE parent_id=? ORDER BY item_ts ASC`,
            data:[itemId]
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
  // _getFolderItems({folderId,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     try {
  //       if(!userId){
  //         return reject("user not authenticated");
  //       }
  //       if(!folderId){
  //         return reject("require id");
  //       }
  //       try {
  //         let rows = await this.conn.findAll({
  //           query:`SELECT * FROM items WHERE parent_id=?`,
  //           data:[folderId]
  //         });
  //         return resolve({items:rows});
  //       } catch (e) {
  //         return reject(e.toString());
  //       }
  //     } catch (e) {
  //       return reject(e.toString());
  //     }
  //   });
  // }
  // _addCardToFlashcard({flashcardId,cardTitle,cardType,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     if(!userId){
  //       return reject("user not authenticated");
  //     }
  //     if(!flashcardId){
  //       return reject("require card id");
  //     }
  //     if(!cardTitle || cardTitle?.length<=0){
  //       return reject("require card title");
  //     }
  //     let transactions =[];
  //     const cardId = uuidv4();
  //     cardType = cardType?cardType:"basic";
  //     const cardObj = {
  //       id:cardId,
  //       flashcard_id:flashcardId,
  //       title:cardTitle,
  //       type:cardType
  //     };
  //     transactions.push({
  //       query:`INSERT INTO cards(card_id,flashcard_id,title,type) VALUES(?,?,?,?)`,
  //       data:[cardObj.id,cardObj.flashcard_id,cardObj.title,cardObj.type]
  //     });
  //     if(cardType==="basic"){
  //       transactions.push({
  //         query:`INSERT INTO basicCards(basic_card_id,card_id,text) VALUES(?,?,?)`,
  //         data:[cardObj.id,cardObj.id,".."]
  //       });
  //     }else{
  //       return reject("card type is unknown");
  //     }
  //     try {
  //       let res = await this.conn.transaction({transactions});
  //       if(res.ok){
  //         return resolve({card:cardObj});
  //       }
  //       return resolve(res);
  //     } catch (e) {
  //       return reject(e.toString());
  //     }
  //   });
  // }
  // _getCard({cardId,userId}){
  //   return new Promise(async(resolve, reject)=>{
  //     try {
  //       if(!userId){
  //         return reject("user not authenticated");
  //       }
  //       if(!cardId){
  //         return reject("require card id");
  //       }
  //       //find card
  //       try {
  //         let data = {};
  //         let item = await this.conn.findOne({query:`SELECT * FROM cards WHERE card_id=?`,data:[cardId]});
  //         if(item?.card_id){
  //           data={...item};
  //           if(item?.type==="basic"){
  //             let card = await this.conn.findOne({
  //               query:`SELECT * FROM basicCards WHERE card_id=?`,
  //               data:[cardId]
  //             });
  //             if(card){
  //               data={...data,...card};
  //             }
  //             return resolve({card:data});
  //           }else{
  //             return reject("unknown card type");
  //           }
  //         }else{
  //           return resolve({card:data});
  //         }
  //       } catch (e) {
  //         return reject(e.toString());
  //       }
  //     } catch (e) {
  //       return reject(e.toString());
  //     }
  //   });
  // }

  _getItem({userId,spaceId,itemId}){
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
            if(item?.item_type === "flashcard"){
              try {
                let flashcard = await this.conn.findOne({
                  query:`SELECT * FROM items AS I JOIN flashcards AS F WHERE I.item_id = F.item_id AND I.item_id=? AND I.space_id=?`,
                  data:[itemId,spaceId]
                });
                return resolve({flashcard:flashcard});
              } catch (e) {
                return reject(e.toString());
              }
            }else if(item?.item_type === "folder"){
              try {
                let folder = await this.conn.findOne({
                  query:`SELECT * FROM items AS I JOIN folders AS F WHERE I.item_id = F.item_id AND I.item_id=? AND I.space_id=?`,
                  data:[itemId,spaceId]
                });
                return resolve({folder:folder});
              } catch (e) {
                return reject(e.toString());
              }
            }else if (item?.item_type === "flashcard_card") {
              try {
                let cardData = {};
                let card = await this.conn.findOne({
                  query:`SELECT * FROM items AS I JOIN flashcard_cards AS F WHERE I.item_id = F.item_id AND I.item_id=? AND I.space_id=?`,
                  data:[itemId,spaceId]
                });
                if(card?.card_type){
                  cardData = {...card};
                  if(card.card_type === "basic"){
                    try {
                      let cardTypeData = await this.conn.findOne({
                        query:`SELECT * FROM basic_cards WHERE item_id= ?`,
                        data:[card.item_id]
                      });
                      cardData = {...cardData,...cardTypeData};
                      return resolve({card:cardData});
                    } catch (e) {
                      return reject(e.toString());
                    }
                  }else{
                      return reject(`unkown card type`);
                  }
                }else{
                  return reject("could not find card");
                }
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
  // controller._createSpace({
  //   spaceId,
  //   userId,
  //   item,
  //   folder,
  //   flashCard,
  //   flashcardCard
  // }).then(()=>{
  //
  // }).catch(()=>{
  //
  // });

  // controller._addItemToSpace({
  //   spaceId,
  //   userId,
  //   item,
  //   folder,
  //   flashCard,
  //   flashcardCard
  // }).then(()=>{
  //
  // }).catch(()=>{
  //
  // });
}).catch((err)=>{
    console.log(err);
});
module.exports = controller;
