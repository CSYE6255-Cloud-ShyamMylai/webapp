require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 0;
const router = require('./Routes/index.js');
const sequelize = require('./config/sequelize.js');
// Model and MySql config
const User = require('./models/User.js');
const logger = require('./config/logger.js');
// Start the server
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    logger.log({level: "debug",message: "Listening to the port",metadata: {port: port}});
    try {
        await sequelize.authenticate();
        console.log('Connection Established');
        await User.sync();
        console.log('Database Synced');
        logger.log({level: "info",message: "Database Synced & Connection Established"});
    }
    catch (err) {
        console.log(err);
        logger.log({level: "error",message: "Connection Failed",metadata: {error: err}});
    }
});
// used to parse json from body if the request has body we need this 
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use(router);
