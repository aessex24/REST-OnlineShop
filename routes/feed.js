const express = require ('express');

const router = express.Router();

const feedCtrl = require('../controllers/feed');

//GET all posts
router.get('/posts', feedCtrl.getPosts);

//Create single post
router.post('/post', feedCtrl.createPost);



module.exports = router;