require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 0;
const router = require('./Routes/index.js');
const sequelize = require('./config/sequelize.js');
// Model and MySql config
const User = require('./models/User.js');
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
