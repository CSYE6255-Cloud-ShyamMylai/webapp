const express = require('express');
const app = express();
const createUser = require('./UserEndpoint.js');
const HealthCheck = require('./HealthCheck.js')
const logger = require('../config/logger.js');
app.use('/healthz',HealthCheck);
app.use('/v1/user',createUser);

app.use((req,res) => {
    console.log(req.method,req.path)
    logger.log({
        level: 'error',
        message: `Route not found`,
        metadata: {
            method: req.method,
            path: req.baseUrl + req.path,
            status: 404
        }
    })
    // if(req.path!='/healthz'){
        res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        return res.status(404).send();       
    // }
});

module.exports = app;
