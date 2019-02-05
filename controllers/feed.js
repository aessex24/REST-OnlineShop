const { validationResult } = require('express-validator/check');
const Post = require('../models/Post');
const User = require('../models/User');
const io = require('../socket');

const fs = require('fs');
const path = require('path');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find().countDocuments()
  .then( count => {
    totalItems = count;
    return Post.find().populate('creator').sort({ createdAt: -1 }).skip((currentPage - 1) * perPage).limit(perPage);
  })
  .then(posts => {
    res.status(200).json({ message: 'Fetched Posts successfully', posts: posts, totalItems: totalItems });
  })
  .catch(err => {
    if(!error.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Validation Failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }
  if(!req.file) {
      const error = new Error('No Image Provided');
      error.statusCode = 422;
      throw error;
  }
  let creator;
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post ({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  post.save()
  .then(result => {
    return User.findById(req.userId);
  })
  .then(user => {
    creator = user;
    user.posts.push(post);
    return user.save();
  })
  .then(result => {
    console.log(result);
    io.getIO().emit('posts', {
      action: 'create',
      post: {...post._doc, creator: { _id: req.userId, name: creator.name }},
    });
    res.status(201).json({
      message: 'Post created Successfully!',
      post: post,
      creator: { _id: creator._id, name: creator.name },
    });
  })
  .catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).populate('creator', 'name')
    .then(post => {
      if(!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      console.log(post);
      res.status(200).json({
        message: 'Post Fetched',
        post: post
      });
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file) {
        imageUrl = req.file.path;
    }
    if(!imageUrl) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId).populate('creator')
    .then(post => {
      if(!post) {
          const error = new Error('Post Not Found');
          error.statusCode = 404;
          throw error;
      }
      if(post.creator._id.toString() !== req.userId) {
        const error = new Error('Not Authorized to Edit');
        error.statusCode = 403;
        throw error;
      }
      if(imageUrl !== post.imageUrl) {
          clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      console.log(result);
      io.getIO().emit('posts', {
        action: 'update',
        post: result ,
      });
      res.status(200).json({
          message: 'Post Updated',
          post: result,
      });
    })
    .catch(err => {
      if(!err.statusCode){
          err.statusCode = 500;
        }
        next(err);
    });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post) {
          const error = new Error('Post Not Found');
          error.statusCode = 404;
          throw error;
        }
        if(post.creator.toString() !== req.userId) {
          const error = new Error('Not Authorized to Delete');
          error.statusCode = 403;
          throw error;
        }
        // Check logged in user
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        return User.findById(req.userId);
        
    })    
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      console.log(result);
      io.getIO().emit('posts', {
        action: 'delete',
        post: postId,
      });
      res.status(200).json({
        message: 'Post Deleted!'
      })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    });
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
  .then(user => {
    if(!user) {
      const error = new Error('User Not Found!');
      error.statusCode = 404;
      throw error;
    }
    console.log(user.status);
    res.status(200).json({
      status: user.status,
    });
  })
  .catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500;
      next(err);
    } 
  })
};

exports.updateStatus = (req, res, next) => {
  console.log(req.body);
  const newStatus = req.body.status;
  console.log(`Status to be changed to ${newStatus}`);
  let updateUser;
  User.findById(req.userId)
  .then(user => { 
    if(!user) {
      const error = new Error('User Not Found!');
      error.statusCode = 404;
      throw error;
    }
    console.log(`status before change ${user.status}`);
    updateUser = user;
    updateUser.status = newStatus;
    return updateUser.save();
  })
  .then(result => {
    console.log(`Status before sending response ${updateUser.status}`);
    res.status(200).json({
      message: 'status updated',
      
    });
  })
  .catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500;
      next(err);
    } 
  })
};