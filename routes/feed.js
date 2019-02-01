const express = require ('express');
const { body } = require('express-validator/check');
const router = express.Router();

const feedCtrl = require('../controllers/feed');

//GET all posts
router.get('/posts', feedCtrl.getPosts);

//Create single post
router.post('/post', 
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ]
,feedCtrl.createPost);

router.get('/post/:postId', feedCtrl.getPost);




module.exports = router;