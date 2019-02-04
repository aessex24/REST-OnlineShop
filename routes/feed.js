const express = require ('express');
const { body } = require('express-validator/check');
const router = express.Router();

const feedCtrl = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

//GET all posts
router.get('/posts', isAuth, feedCtrl.getPosts);

//Create single post
router.post('/post', isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ]
,feedCtrl.createPost);

router.get('/post/:postId', isAuth, feedCtrl.getPost);

router.put('/post/:postId', isAuth,
    [
        body('title').trim().isLength({ min: 5 }),
        body('content').trim().isLength({ min: 5 }),
    ]
,feedCtrl.updatePost);


router.delete('/post/:postId', isAuth, feedCtrl.deletePost);

router.get('/status', isAuth, feedCtrl.getStatus);

router.put('/status', isAuth, feedCtrl.updateStatus);

module.exports = router;