const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if(!authHeader) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  console.log(token);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, keys.jwtSecret);
  } catch(err) {
    err.statusCode = 500;
    throw err;
  }
  if(!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  console.log(decodedToken);
  req.userId = decodedToken.userId;
  next();
};