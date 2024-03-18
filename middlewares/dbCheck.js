const { Sequelize } = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/sequelize');
const logger = require('../config/logger');

const dbCheck = async (req,res,next)=>{
    try{
        await sequelize.authenticate();
        logger.log({
            level: 'debug',
            message: `Database Connection Check`})
        next();
    }
    catch(err){
        logger.log({
            level: 'error',
            message: `Database Connection Failed (dbCheck.js)`,
            metadata: {
                error: err
            }
        })
        return res.status(503).send();
    }

}

module.exports = dbCheck;
