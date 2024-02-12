require('dotenv').config();
module.exports ={
    development :{
        database : 'testDB',
        username : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        // host : 'localhost',
        host:'127.0.0.1',
        dialect : 'mysql',
    }
}
