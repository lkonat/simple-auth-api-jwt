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
  Model.getCard({cardId:id}).then((success)=>{
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

exports.getItemContent = getItemContent;
exports.getCard = getCard;
exports.getFlashcardCards = getFlashcardCards;
exports.addCardToFlashcard = addCardToFlashcard;
exports.createFlashcard = createFlashcard;
exports.createSpace = createSpace;
exports.getSpaces = getSpaces;
exports.createFolder = createFolder;
exports.getSpaceItems = getSpaceItems;
