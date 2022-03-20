const Model = require("../models/index.js");

function createSpace(req,res){
  const {spaceName} = req.body;
  const userId = req?.auth?.id;
  Model.createSpace({spaceName,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function getSpaces(req,res){
  const userId = req?.auth?.id;
  Model.getSpaces({userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function createFolder(req,res){
  const {inFolderId,folderName,spaceId} = req.body;
  const userId = req?.auth?.id;
  Model.createFolder({inFolderId,folderName,spaceId,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function getSpaceItems(req,res){
  const {spaceId} = req.params;
  const userId = req?.auth?.id;
  Model.getSpaceItems({userId,spaceId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}
function createFlashcard(req,res){
  const {inFolderId,cardName,spaceId} = req.body;
  const userId = req?.auth?.id;
  Model.createFlashcard({inFolderId,cardName,spaceId,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}


function addCardToFlashcard(req,res){
  const {flashcardId,cardTitle,cardType} = req.body;
  const userId = req?.auth?.id;
  console.log({flashcardId,cardTitle,cardType});
  Model.addCardToFlashcard({flashcardId,cardTitle,cardType,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}
function getFlashcardCards(req,res){
  const {id} = req.params;
  const userId = req?.auth?.id;
  Model.getFlashcardCards({flashcardId:id,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function getCard(req,res){
  const {id} = req.params;
  const userId = req?.auth?.id;
  Model.getCard({cardId:id,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}
function getItemContent(req,res){
  const {itemId} = req.params;
  const userId = req?.auth?.id;
  Model.getItemContent({itemId:itemId,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function updateCard(req,res){
  const {cardId,cardType,changes} = req.body;
  const userId = req?.auth?.id;
  Model.updateCard({cardId,changes,cardType,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}
function createSpaceItem(req,res){
  const {spaceId,parentId,folder,flashcard,flashcardCard} = req.body;
  const userId = req?.auth?.id;
  if(!userId){
    return res.status(400).json({error:'user id is missing'});
  }
  Model.createSpaceItem({spaceId,parentId,folder,flashcard,flashcardCard,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function getSpaceItemChids(req,res){
  const {spaceId,itemId} = req.body;
  const userId = req?.auth?.id;
  if(!userId){
    return res.status(400).json({error:'user id is missing'});
  }
  Model.getSpaceItemChids({spaceId,itemId,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function getSpaceItem(req,res){
  const {spaceId,itemId} = req.body;
  const userId = req?.auth?.id;
  if(!userId){
    return res.status(400).json({error:'user id is missing'});
  }
  Model.getSpaceItem({spaceId,itemId,userId}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

function updateItem(req,res){
  const {spaceId,itemId,changes} = req.body;
  const userId = req?.auth?.id;
  if(!userId){
    return res.status(400).json({error:'user id is missing'});
  }
  Model.updateItem({spaceId,itemId,userId,changes}).then((success)=>{
    res.json(success);
  }).catch((err)=>{
    res.status(400).json({error:err});
  });
}

exports.updateItem = updateItem;
exports.getSpaceItemChids= getSpaceItemChids;
exports.getSpaceItem= getSpaceItem;
exports.createSpaceItem = createSpaceItem;
exports.updateCard = updateCard;
exports.getItemContent = getItemContent;
exports.getCard = getCard;
exports.getFlashcardCards = getFlashcardCards;
exports.addCardToFlashcard = addCardToFlashcard;
exports.createFlashcard = createFlashcard;
exports.createSpace = createSpace;
exports.getSpaces = getSpaces;
exports.createFolder = createFolder;
exports.getSpaceItems = getSpaceItems;
