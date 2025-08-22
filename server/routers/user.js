const express = require('express');
const authenticator = require('../middleware/authenticator.js');

const userController = require('../controllers/user.js');
const userRouter = express.Router();

userRouter.post('/login', userController.logUserIn);
userRouter.post('/signup', userController.createUser);

module.exports = userRouter;