const { Sequelize } = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/sequelize');
const logger = require('../config/logger');

const dbCheck = async (req,res,next)=>{
    try{
        await sequelize.authenticate();
        logger.debug(`Database Connection Check`);
        next();
    }
    catch(err){
        logger.error(`Database Connection Failed (dbCheck.js)` , {method: req.method, path: req.baseUrl + req.path, status: 503, error: err});
        return res.status(503).send();
    }

}

module.exports = dbCheck;
