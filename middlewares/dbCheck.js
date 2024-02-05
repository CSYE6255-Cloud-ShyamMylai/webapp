const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    // logging : console.log // displaying the logs from sequlize 
    logging: false // disable logging
});

const dbCheck = async (req,res,next)=>{
    try{
        await sequelize.authenticate();
        next();
    }
    catch(err){
        return res.status(503).send();
    }

}

module.exports = dbCheck;
