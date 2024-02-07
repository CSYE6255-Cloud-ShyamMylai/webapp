const express = require('express');
const app = express();
const createUser = require('./UserEndpoint.js');
const HealthCheck = require('./HealthCheck.js')

app.use('/healthz',HealthCheck);
app.use('/v1/user',createUser);

app.use((req,res) => {
    console.log(req.method,req.path)
    // if(req.path!='/healthz'){
        res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        return res.status(404).send();       
    // }
});

module.exports = app;
