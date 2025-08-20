const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User.js');

async function createUser(req, res) {
    try {

        const { fullname, username, date_of_birth, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS);

        const user = await User.createUser(fullname, username, date_of_birth, email, hashedPassword);

        const payload = {username: user.username}

        const sendToken = (err, token) => {
            if (err) {
                throw new Error('Error in token generation');
            }

            const payload = {username: user.username};

            res.status(201).json({
                success: true,
                token: token
            });
        }

        jwt.sign(payload, process.env.SECRET_TOKEN, {expiresIn: 3600}, sendToken);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function logUserIn(req, res) {
    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS);

        const user = await User.Login(username, hashedPassword);

        if (user) {

            const payload = {username: user.username};

            const sendToken = (err, token) => {
            if (err) {
                throw new Error('Error in token generation');
            }

            const payload = {username: user.username};

            res.status(201).json({
                success: true,
                token: token
            });

            jwt.sign(payload, process.env.SECRET_TOKEN, {expiresIn: 3600}, sendToken);

        }

        } else {
            throw new Error('User could not be authenticated');
        }
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createUser,
    logUserIn
}