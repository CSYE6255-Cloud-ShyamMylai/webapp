const express = require('express');

const config = require('../config/config.js');
const app = express();
const sequelize = require('../config/sequelize.js');

app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
    if (req.method != "GET") {
        return res.status(405).send();
    }
    // ensuring that only '/healthz' get verified not '/healthz/*'
    else if(req.path !='/'){
        return res.status(404).send();
    }
    else{
        // checking if the request has any query or body or content-length
        if (Object.keys(req.query).length !=0  || req._body == true || req.get('Content-length') != undefined) {
            return res.status(400).send();
        }
        // res.setHeader('Content-Type', 'application/json');
        sequelize.authenticate(config.development).then(async() => {
            // const dbAdd = await User.sync({force:true});
            return res.status(200).send();
        }
        ).catch(err => {
            console.error(err)
            return res.status(503).send();
        });
    }
})

module.exports = app;
