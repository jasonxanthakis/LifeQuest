const jwt = require('jsonwebtoken');

function authenticator(req, res, next) {
    const token = req.headers['authorization'];

    if (token) {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, data) => {
            if (err) {
                res.status(403).json({err: 'Invalid token'});
            } else {
                req.user = data.username;
                next();
            }
        });
    } else {
        res.status(403).json({err: 'Missing token'});
    }
}

module.exports = authenticator;