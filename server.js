require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 0;
const { Sequelize } = require('sequelize');
const config = require('./config.js');
const router = require('./Routes/index.js');

// routes 
const createUser = require('./Routes/UserEndpoint.js');
const HealthCheck = require('./Routes/HealthCheck.js')
// Model and MySql config
const User = require('./models/User.js');
const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    // logging : console.log // displaying the logs from sequlize 
    logging: false // disable logging
});

// Start the server
app.listen(port, async() => {
    console.log(`Server running on port ${port}`);
    try{
        await sequelize.authenticate();
        console.log('Connection Established');
        await User.sync();
        console.log('Database Synced');
    }
    catch(err){
        console.log(err);
    }
});
// used to parse json from body if the request has body we need this 
app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.use(router);
