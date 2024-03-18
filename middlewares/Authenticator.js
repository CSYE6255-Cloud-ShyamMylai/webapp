const User = require('../models/User');
const bcrypt = require('bcrypt')
const logger = require('../config/logger.js');
const checkAuth = async (req, res, next) => {
    logger.log({
        level: 'info',
        message: `Entering Authenticator.js`,
        metadata: {
            method: req.method,
            path: req.baseUrl + req.path,
            status: 200
        }
    })
    try {
        const credentials = req.headers.authorization.split(' ')[1];
        const [username, password] = Buffer.from(credentials, 'base64').toString().split(":");
        const response = await User.findOne({
            where: {
                username: username
            }
        })
        if (!response) {
            logger.log({
                level: 'error',
                message: `User not found for user ${username} in the database`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 401
                }
            })
            return res.status(401).send();
        }
        const validCreds = await bcrypt.compare(password, response.password);
        if (validCreds) {
            // return res.status(201).send()s; 
            req.username = username
            logger.log({
                level: 'info',
                message: `Valid credentials for user ${username}`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 200
                }
            })
            next();
        }
        else {
            logger.log({
                level: 'error',
                message: `Invalid credentials for user ${username}`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 401
                }
            })
            return res.status(401).send();
        
        }

    }
    catch (err) {
        console.error("Error",err);
        res.status(401).send();
    }

}

module.exports = checkAuth
