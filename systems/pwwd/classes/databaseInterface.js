class DatabasesInterface {
  constructor() {

  }
  static get typeRules(){
    return {
      "folder":{canHost:"*"},
      "flashcard":{canHost:{"flashcard_card":true}},
      "flashcard_card":{canHost:false}
    };
  }
  _createSpace(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });

  }
  _getSpace(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });
  }
  _createFolder(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });
  }
  _getSpaceItems(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });
  }
  _createFlashcard(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });
  }
  __addCardToFlashcard(){
    return new Promise((resolve, reject)=>{
      return reject("not implemented");
    });
  }
}
module.exports = DatabasesInterface;
