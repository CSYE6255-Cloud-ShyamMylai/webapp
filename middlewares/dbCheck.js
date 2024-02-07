const { Sequelize } = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/sequelize');

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
