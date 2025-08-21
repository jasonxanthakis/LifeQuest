const logger = (req, res, next) => {
    console.log(req.method, req.hostname, req.path, req.time);
    next();
};

module.exports = logger;