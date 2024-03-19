const express = require('express');
const User = require('../models/User.js');
const app = express();
const bcrypt = require('bcrypt');
//middle ware 
const dbCheck = require('../middlewares/dbCheck.js');
const checkAuth = require('../middlewares/Authenticator.js')
const logger = require('../config/logger.js');

app.use(express.json())
app.get('/self', [(req, res, next) => {
    if (Object.keys(req.query).length != 0 || req._body == true || req.get('Content-length') != undefined ||
    req.get('accept') != 'application/json' ){
        logger.log({
            level: 'error',
            message: `Failed due to invalid request body or headers`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 400
            }
        })
        return res.status(400).send();
    }
    next();
}, dbCheck, checkAuth], async (req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['first_name', 'last_name', 'username', 'id', 'account_created', 'account_updated'],
            where: {
                username: req.username
            }
        })
        // res.setHeader('Content-Type', 'application/json');
        res.setHeader('Accept', 'application/json');
        logger.log({
            level: 'info',
            message: `User with username ${req.username} has been fetched`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 200
            }
        })
        return res.status(200).send(response);
    }
    catch (err) {
        logger.log({
            level: 'error',
            message: `User with username ${req.username} couldn't be fetched (UserEndpoint.js)`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 400,
                error: err
            }
        })
        return res.send(400).send()
    }
})

app.put('/self', [(req, res, next) => {
    //inline check for the body before dbCheck and authCheck 
    const { password, first_name, last_name, username, ...anythingelse } = req.body;
    if (username != undefined || (!password && !first_name && !last_name) || Object.keys(req.query).length != 0 || Object.keys(anythingelse).length != 0  || req.get('content-type') != 'application/json'){
        logger.log({
            level: 'error',
            message: `Failed due to invalid request body or headers check the body for the put request`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 400
            }
        })
        return res.status(400).send();
    }
    next();
}, dbCheck, checkAuth], async (req, res) => {

    try {
        const { password, first_name, last_name, username, ...anythingelse } = req.body;
        const userForUpdation = await User.findOne({ where: { username: req.username } });
        // const validCreds = await bcrypt.compare(password, userForUpdation.password);
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
        logger.log({
            level: 'info',
            message: `User with username ${req.username} has been updated`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 204
            }
        })
        return res.status(204).send();

    }
    catch (err) {
        console.log(err);
        logger.log({
            level: 'error',
            message: `User with username ${req.username} couldn't be updated (UserEndpoint.js)`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                status: 400,
                error: err
            }
        })
        return res.status(400).send();
    }

})

app.post('/', [
    (req, res, next) => {
        logger.log({
            level: 'debug',
            message: `entered middleware for checking the request body and headers`,
            metadata: {
                method: req.method,
                path: req.baseUrl + req.path,
                // status: 201
            }
        
        })
        if (req._body == false || req.get('Content-length') == undefined || Object.keys(req.query).length != 0
        || req.get('accept') != 'application/json' || req.get('content-type') != 'application/json') {
            logger.log({
                level: 'error',
                message: `Failed due to invalid request body or headers`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 400
                }
            })
            return res.status(400).send();
        }
        if(req.headers.authorization != undefined){
            const [username, password] = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(":");
            if((username && username.length>0) ||( password &&  password.length>0)){
                logger.log({
                    level: 'error',
                    message: `Authorization header is not required`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }   
                })
                return res.status(400).send({message:"Authorization header is not required"});
            }
        }
        next();
    }, (req, res, next) => {
        const { first_name, last_name, username, password, ...anythingelse } = req.body;
        switch (true) {
            case !first_name && !last_name && !username && !password:
                logger.log({
                    level: 'error',
                    message: `firstname, lastname , username and password are missing in the body`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "All fields required are missing in the body" });
                break;
            case !first_name:
                logger.log({
                    level: 'error',
                    message: `First name is missing in the body`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "First name is missing in the body" });
                break;
            case !last_name:
                logger.log({
                    level: 'error',
                    message: `Last name is missing in the body`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "Last name is missing in the body" });
                break;
            case !username:
                logger.log({
                    level: 'error',
                    message: `Username is missing in the body`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "Username is missing in the body" });
                break;
            case !password:
                logger.log({
                    level: 'error',
                    message: `Password is missing in the body`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "Password is missing in the body" });
                break;
            case Object.keys(anythingelse).length != 0:
                logger.log({
                    level: 'error',
                    message: `Other properties are present but shouldn't be there`,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                res.status(400).send({ message: "Other properties shouldn't be present" })
            default:
                next();
        }
    }, dbCheck], async (req, res) => {
        try {
            const { first_name, last_name, username, password, ...anythingelse } = req.body;
            const emailCheck = await User.count({ where: { username: username } });
            if (emailCheck > 0) {
                logger.log({
                    level: 'error',
                    message: `Username ${username} already exists hence failed to create user `,
                    metadata: {
                        method: req.method,
                        path: req.baseUrl + req.path,
                        status: 400
                    }
                })
                return res.status(400).send({ message: "Username already exists" });
            }
            const creationResponse = await User.create({
                first_name: first_name,
                last_name: last_name,
                username: username,
                password: password,
            });
            logger.log({
                level: 'info',
                message: `User with username ${username} has been created`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 201
                }
            })
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
            logger.log({
                level: 'error',
                message: `User with username ${username} couldn't be created (UserEndpoint.js)`,
                metadata: {
                    method: req.method,
                    path: req.baseUrl + req.path,
                    status: 400,
                    error: err
                }
            })
            return res.status(400).send({
                message: err.message,
            });
        }
        // }
        // }
    });

app.use((req, res) => {
    const allMethods = ["GET", 'PUT', 'POST']
    if (allMethods.indexOf(req.method) == -1) return res.status(405).send();
    if (req.path == '/' && req.method != 'POST') return res.status(405).send();
    if (req.path == '/self' && (['GET', 'PUT'].indexOf(req.method) == -1)) return res.status(405).send();
    if (req.path.includes('/self') && ['GET', 'PUT'].indexOf(req.method) == -1) return res.status(405).send();
    return res.status(404).send()
})



module.exports = app;
