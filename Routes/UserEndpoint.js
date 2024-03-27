const express = require('express');
const User = require('../models/User.js');
const app = express();
const bcrypt = require('bcrypt');
//middle ware 
const dbCheck = require('../middlewares/dbCheck.js');
const checkAuth = require('../middlewares/Authenticator.js')
const logger = require('../config/logger.js');
const [publishMessage, checkTopicExists] = require('../services/publishMessage.js');

app.use(express.json())
app.get('/self', [(req, res, next) => {
    if (Object.keys(req.query).length != 0 || req._body == true || req.get('Content-length') != undefined ||
    req.get('accept') != 'application/json' ){
        logger.error("Failed due to invalid request body or headers", {method: req.method, path: req.baseUrl + req.path, status: 400});
        return res.status(400).send();
    }
    next();
}, dbCheck, checkAuth], async (req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['first_name', 'last_name', 'username', 'id', 'account_created', 'account_updated','isVerified'],
            where: {
                username: req.username
            }
        })
        if(process.env.NODE_ENV !== "test" && response.dataValues.isVerified == false){
            logger.warn("User is not verified", {method: req.method, path: req.baseUrl + req.path, status: 403});
            return res.status(401).send();
        }
        // res.setHeader('Content-Type', 'application/json');
        res.setHeader('Accept', 'application/json');
        logger.info(`User with username ${req.username} has been fetched`, {method: req.method, path: req.baseUrl + req.path, status: 200});
        return res.status(200).send(response);
    }
    catch (err) {
        logger.error(`User with username ${req.username} couldn't be fetched (UserEndpoint.js)`, {method: req.method, path: req.baseUrl + req.path, status: 400, error: err});  
        return res.send(400).send()
    }
})

app.put('/self', [(req, res, next) => {
    //inline check for the body before dbCheck and authCheck 
    const { password, first_name, last_name, username, ...anythingelse } = req.body;
    if (username != undefined || (!password && !first_name && !last_name) || Object.keys(req.query).length != 0 || Object.keys(anythingelse).length != 0  || req.get('content-type') != 'application/json'){
        logger.warn("Failed due to invalid request body or headers check the body for the put request", {method: req.method, path: req.baseUrl + req.path, status: 400});
        return res.status(400).send();
    }
    next();
}, dbCheck, checkAuth], async (req, res) => {

    try {
        const { password, first_name, last_name, username, ...anythingelse } = req.body;
        const userForUpdation = await User.findOne({ where: { username: req.username } });
        // const validCreds = await bcrypt.compare(password, userForUpdation.password);
        if(process.env.NODE_ENV !== "test" && !userForUpdation.dataValues.isVerified){
            logger.warn("User is not verified", {method: req.method, path: req.baseUrl + req.path, status: 403});
            return res.status(401).send();
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password,10);

            await userForUpdation.update({
                first_name: first_name ? first_name : userForUpdation.first_name,
                last_name: last_name ? last_name : userForUpdation.last_name,
                password: hashedPassword
            });
        }
        else{
            // reason for findOne is because on doing update with the where clause it runs builkUpdate hook which isn't required
            await userForUpdation.update({
                first_name: first_name ? first_name : userForUpdation.first_name,
                last_name: last_name ? last_name : userForUpdation.last_name,
                // password: password ? password : userForUpdation.password
            });
        }
        logger.info(`User with username ${req.username} has been updated`, {method: req.method, path: req.baseUrl + req.path, status: 204});
        return res.status(204).send();

    }
    catch (err) {
        console.log(err);
        logger.error(`User with username ${req.username} couldn't be updated (UserEndpoint.js)`, {method: req.method, path: req.baseUrl + req.path, status: 400, error: err});
        return res.status(400).send();
    }

})

app.post('/', [
    (req, res, next) => {
        logger.debug("entered middleware for checking the request body and headers", {method: req.method, path: req.baseUrl + req.path});
        if (req._body == false || req.get('Content-length') == undefined || Object.keys(req.query).length != 0
        || req.get('accept') != 'application/json' || req.get('content-type') != 'application/json') {
            logger.warn("Failed due to invalid request body or headers", {method: req.method, path: req.baseUrl + req.path, status: 400});
            return res.status(400).send();
        }
        if(req.headers.authorization != undefined){
            const [username, password] = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(":");
            if((username && username.length>0) ||( password &&  password.length>0)){
                logger.warn("Authorization header is not required", {method: req.method, path: req.baseUrl + req.path, status: 400});
                return res.status(400).send({message:"Authorization header is not required"});
            }
        }
        next();
    }, (req, res, next) => {
        const { first_name, last_name, username, password, ...anythingelse } = req.body;
        switch (true) {
            case !first_name && !last_name && !username && !password:
                logger.warn("firstname, lastname , username and password are missing in the body", {method: req.method, path: req.baseUrl + req.path, status: 400});   
                res.status(400).send({ message: "All fields required are missing in the body" });
                break;
            case !first_name:
                logger.warn("First name is missing in the body", {method: req.method, path: req.baseUrl + req.path, status: 400});
                res.status(400).send({ message: "First name is missing in the body" });
                break;
            case !last_name:
                logger.warn("Last name is missing in the body", {method: req.method, path: req.baseUrl + req.path, status: 400});
                res.status(400).send({ message: "Last name is missing in the body" });
                break;
            case !username:
                logger.warn("Username is missing in the body", {method: req.method, path: req.baseUrl + req.path, status: 400});
                res.status(400).send({ message: "Username is missing in the body" });
                break;
            case !password:
                logger.warn("Password is missing in the body", {method: req.method, path: req.baseUrl + req.path, status: 400});
                res.status(400).send({ message: "Password is missing in the body" });
                break;
            case Object.keys(anythingelse).length != 0:
                logger.warn("Other properties are present but shouldn't be there", {method: req.method, path: req.baseUrl + req.path, status: 400});
                res.status(400).send({ message: "Other properties shouldn't be present" })
            default:
                next();
        }
    }, dbCheck], async (req, res) => {
        try {
            const { first_name, last_name, username, password, ...anythingelse } = req.body;
            const emailCheck = await User.count({ where: { username: username } });
            if (emailCheck > 0) {
                logger.warn(`Username ${username} already exists hence failed to create user `, {method: req.method, path: req.baseUrl + req.path, status: 400});
                return res.status(400).send({ message: "Username already exists" });
            }
            const creationResponse = await User.create({
                first_name: first_name,
                last_name: last_name,
                username: username,
                password: password,
            });
            if (process.env.NODE_ENV !== "test") {
                const topicExists = await checkTopicExists('verify_email');
                if (!topicExists) {
                    logger.error("Topic doesn't exist", { method: req.method, path: req.baseUrl + req.path, status: 400 });
                    return res.status(400).send();
                }
                const pubRes = await publishMessage('verify_email', {
                    firstName: creationResponse.first_name,
                    lastName: creationResponse.last_name,
                    email: creationResponse.username,
                }, creationResponse.dataValues.verificationToken);
                if (!pubRes) {
                    logger.error("Failed to publish message", { method: req.method, path: req.baseUrl + req.path, status: 400 });
                    return res.status(400).send();
                }
            }

            logger.info(`User with username ${username} has been created`, {method: req.method, path: req.baseUrl + req.path, status: 201});
            // res.setHeader('Content-Type', 'application/json');
            res.setHeader('Accept', 'application/json');
            return res.status(201).send({
                id:creationResponse.id,
                first_name: creationResponse.first_name,
                last_name: creationResponse.last_name,
                username:creationResponse.username,
                account_created:creationResponse.account_created,
                account_updated:creationResponse.account_updated,
            });
        } catch (err) {
            logger.error(`User with username ${username} couldn't be created (UserEndpoint.js)`, {method: req.method, path: req.baseUrl + req.path, status: 400, error: err});
            return res.status(400).send({
                message: err.message,
            });
        }
        // }
        // }
    });

    app.use('/verify', async (req, res) => {
        try{
            let {email, verificationToken} = req.query;
            if(!email || !verificationToken){
                logger.warn("Email or token is missing", {method: req.method, path: req.baseUrl + req.path, status: 400});
                return res.status(400).send();
            }
            email = email.trim();
            verificationToken = verificationToken.trim();
            const user = await User.findOne({ where: { username: email ,verificationToken:verificationToken} });
            if (!user) {
                logger.warn("User doesn't exist", { method: req.method, path: req.baseUrl + req.path, status: 400 });
                return res.status(400).send();
            }
            logger.debug('logger timestamp', {data: user.dataValues.account_created})
            const createdAtTimeStamp = new Date(user.dataValues.account_created);
            const currentTimeStamp = new Date();
            const timeDiff = currentTimeStamp - createdAtTimeStamp;
            if (timeDiff > 120000) {
                logger.warn("Token has expired", { method: req.method, path: req.baseUrl + req.path, status: 400 });
                return res.status(400).send();
            }
            await user.update({ isVerified: true });
            logger.info("User has been verified successfully", {method: req.method, path: req.baseUrl + req.path, status: 200});
            return res.status(200).send("User has been verified successfully");
        }
        catch(err){
            logger.error("Error in verifying the user", {method: req.method, path: req.baseUrl + req.path, status: 400, error: err});
            return res.status(400).send();
        }
    
    })

app.use((req, res) => {
    const allMethods = ["GET", 'PUT', 'POST']
    if (allMethods.indexOf(req.method) == -1) return res.status(405).send();
    if (req.path == '/' && req.method != 'POST') return res.status(405).send();
    if (req.path == '/self' && (['GET', 'PUT'].indexOf(req.method) == -1)) return res.status(405).send();
    if (req.path.includes('/self') && ['GET', 'PUT'].indexOf(req.method) == -1) return res.status(405).send();
    return res.status(404).send()
})



module.exports = app;
