const express = require('express');
const router = express.Router();
const {
  createSpace,
  getSpaces,
  createFolder,
  getSpaceItems,
  createFlashcard,
  addCardToFlashcard,
  getFlashcardCards,
  getItemContent,
  getCard,
  updateCard,
  createSpaceItem,

getSpaceItem,
getSpaceItemChids,
updateItem,
deleteItem
} = require("../controllers");
const {ensureAuth,ensureAdmin} = require("../controllers/auth");
const {body} = require('express-validator');
router.post('/space',ensureAuth,createSpace);
router.get('/spaces',ensureAuth,getSpaces);
router.post('/folder',ensureAuth,createFolder);
router.get('/space/:spaceId',ensureAuth,getSpaceItems);
// router.get('/space/item/:itemId',ensureAuth,getItemContent);
router.post('/flashcard/card',ensureAuth,addCardToFlashcard);


//
// router.get('/flashcard/:id',ensureAuth,getFlashcardCards);
// router.post('/flashcard',ensureAuth,createFlashcard);
// router.get('/flashcard/card/:id',ensureAuth,getCard);

router.post('/space/item',ensureAuth,createSpaceItem);
router.post('/space/item/childs',ensureAuth,getSpaceItemChids);
router.post('/space/item/info',ensureAuth,getSpaceItem);
router.put('/space/item',ensureAuth,updateItem);
router.delete('/space/item',ensureAuth,deleteItem);
router.post('/flashcard/cards',ensureAuth,getFlashcardCards);
module.exports = router;
