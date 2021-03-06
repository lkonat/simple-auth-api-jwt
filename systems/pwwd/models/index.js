const {sqliteController} = require("../databases/index.js");
const Controller = sqliteController;

function createSpace(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._createSpace(args);
      return resolve({success:true});
    } catch (e) {
      return reject(e);
    }
  });
}


function getSpaces(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getSpaces(args);
      return resolve({spaces:outcome.spaces});
    } catch (e) {
      return reject(e);
    }
  });
}
function createFolder(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._createFolder(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

function getSpaceItems(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getSpaceItems(args);
      return resolve({items:outcome.items});
    } catch (e) {
      return reject(e);
    }
  });
}

function createFlashcard(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._createFlashcard(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

function addCardToFlashcard(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._addCardToFlashcard(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}
function getFlashcardCards(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getFlashcardCards(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

function getCard(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getCard(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}


function getItemContent(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getItemContent(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}
function updateCard(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._updateCard(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

function createSpaceItem(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._addItemToSpace(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

function getSpaceItem(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getItem(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}
function getSpaceItemChids(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._getItemChilds(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}
function updateItem(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._updateItem(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}
function deleteItem(args){
  return new Promise(async(resolve, reject)=>{
    try {
      let outcome = await Controller._deleteItem(args);
      return resolve(outcome);
    } catch (e) {
      return reject(e);
    }
  });
}

exports.deleteItem = deleteItem;
exports.updateItem = updateItem;
exports.getSpaceItem = getSpaceItem;
exports.getSpaceItemChids = getSpaceItemChids;
exports.createSpaceItem = createSpaceItem;
exports.updateCard = updateCard;
exports.getItemContent= getItemContent;
exports.getCard = getCard;
exports.getFlashcardCards = getFlashcardCards;
exports.addCardToFlashcard = addCardToFlashcard;
exports.createSpace= createSpace;
exports.getSpaces = getSpaces;
exports.createFolder = createFolder;
exports.getSpaceItems = getSpaceItems;
exports.createFlashcard = createFlashcard;
