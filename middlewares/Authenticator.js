const User = require('../models/User');
const bcrypt = require('bcrypt')

const checkAuth = async (req, res, next) => {
    try {
        const credentials = req.headers.authorization.split(' ')[1];
        const [username, password] = Buffer.from(credentials, 'base64').toString().split(":");
        const response = await User.findOne({
            where: {
                username: username
            }
        })
        if (!response) return res.status(401).send();
        const validCreds = await bcrypt.compare(password, response.password);
        if (validCreds) {
            // return res.status(201).send()s; 
            req.username = username
            next();
        }
        else {
            return res.status(401).send();
        
        }

    }
    catch (err) {
        console.error("Error",err);
        res.status(401).send();
    }

}

module.exports = checkAuth
