const express = require('express');

const config = require('../config/config.js');
const app = express();
const sequelize = require('../config/sequelize.js');
const logger = require('../config/logger.js');

app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
    if (req.method != "GET") {
        logger.warn(`Method not allowed for health check`, {method: req.method, path: req.baseUrl + req.path, status: 405});
        return res.status(405).send();
    }
    // ensuring that only '/healthz' get verified not '/healthz/*'
    else if(req.path !='/'){
        logger.warn(`trying to access invalid route for health check anything other than /healthz is not allowed`, {method: req.method, path: req.baseUrl + req.path, status: 404});
        return res.status(404).send();
    }
    else{
        // checking if the request has any query or body or content-length
        if (Object.keys(req.query).length !=0  || req._body == true || req.get('Content-length') != undefined) {
            logger.warn("Failed due to invalid request body or headers shouldn't have query or body or content length", {method: req.method, path: req.baseUrl + req.path, status: 400});
            return res.status(400).send();
        }
        // res.setHeader('Content-Type', 'application/json');
        sequelize.authenticate(config.development).then(async() => {
            // const dbAdd = await User.sync({force:true});
            logger.info(`Health Check Passed`, {method: req.method, path: req.baseUrl + req.path, status: 200});
            return res.status(200).send();
        }
        ).catch(err => {
            console.error(err)
            logger.error(`Health Check Failed`, {method: req.method, path: req.baseUrl + req.path, status: 503, error: err});
            return res.status(503).send();
        });
    }
})

module.exports = app;
