const { validationResult } = require('express-validator/check');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      { 
        _id: '1',
        title: 'First Post', 
        content: 'This is the first post!', 
        imageUrl: 'images/duck.jpeg',
        creator: {
          name: 'Andrew'
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation Failed, entered data is incorrecy',
      errors: error.array()
    });
  }
  const title = req.body.title;
  const content = req.body.content;
  console.log(title, content);
  // Create post in db
  res.status(201).json({
    message: 'Post created Successfully!',
    post: { 
      _id: '3',
      imageUrl: 'images/duck.jpeg',
      createdAt: new Date().toISOString(), 
      creator: {
        name: 'amdrew'
      },
      title: title, 
      content: content
    }
  });
};