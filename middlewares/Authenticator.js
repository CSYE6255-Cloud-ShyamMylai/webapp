const User = require('../models/User');
const bcrypt = require('bcrypt')
const logger = require('../config/logger.js');
const checkAuth = async (req, res, next) => {
    logger.debug(`Entering Authenticator.js`, {method: req.method, path: req.baseUrl + req.path, status: 200})
    try {
        const credentials = req.headers.authorization.split(' ')[1];
        const [username, password] = Buffer.from(credentials, 'base64').toString().split(":");
        const response = await User.findOne({
            where: {
                username: username
            }
        })
        if (!response) {
            logger.warn(`User not found for user ${username} in the database`, {method: req.method, path: req.baseUrl + req.path, status: 401})
            return res.status(401).send();
        }
        const validCreds = await bcrypt.compare(password, response.password);
        if (validCreds) {
            // return res.status(201).send()s; 
            req.username = username
            logger.info(`Valid credentials for user ${username}`, {method: req.method, path: req.baseUrl + req.path, status: 200});
            next();
        }
        else {
            logger.warn(`Invalid credentials for user ${username}`, {method: req.method, path: req.baseUrl + req.path, status: 401});
            return res.status(401).send();
        
        }

    }
    catch (err) {
        console.error("Error",err);
        logger.error(`Error in Authenticator.js , processed a request which can break server`, {method: req.method, path: req.baseUrl + req.path, status: 401, error: err});
        res.status(401).send();
    }

}

module.exports = checkAuth
