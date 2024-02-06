
const { Sequelize, DataTypes, UUIDV1 } = require('sequelize');
const config = require('../config.js');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    // logging : console.log // displaying the logs from sequlize 
    logging: false // disable logging
});
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue:UUIDV1
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            is:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}/i,
            
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    }
},
    {
        timestamps: true,
        updatedAt: 'account_updated',
        createdAt: 'account_created'
    })

User.beforeCreate(async (user,options) =>{
    const hashedPassword = await bcrypt.hash(user.password,10);
    user.password = hashedPassword
})

User.beforeUpdate(async (user,options) =>{
    options.validate=false;
    const hashedPassword = await bcrypt.hash(user.password,10);
    user.password = hashedPassword
})

module.exports = User;
