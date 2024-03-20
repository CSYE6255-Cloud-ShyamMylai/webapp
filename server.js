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
    logger.debug(`Listening to the port ${port}`, {port: port});
    try {
        await sequelize.authenticate();
        await User.sync();
        logger.info("Database Synced & Connection Established")
    }
    catch (err) {
        logger.error("Connection Failed", {error: err});
    }
});
// used to parse json from body if the request has body we need this 
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use(router);

process.on('uncaughtExceptionMonitor', (err, origin) => {
    logger.error("Uncaught Exception", {error: err, origin: origin});
    process.exit(1);
});
