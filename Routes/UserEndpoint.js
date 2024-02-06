const express = require('express');
const User = require('../models/User.js');
const app = express();
//middle ware 
const dbCheck = require('../middlewares/dbCheck.js');
const checkAuth = require('../middlewares/Authenticator.js')


app.get('/self', [dbCheck,checkAuth], async (req, res) => {
    if (Object.keys(req.query).length !=0  || req._body == true || req.get('Content-length') != undefined) {
        return res.status(400).send();
    }
    try{
        const response = await User.findOne({
            attributes: ['first_name', 'last_name', 'username', 'id', 'account_created', 'account_updated'],
            where: {
                username: req.username
            }
        })
        return res.status(200).send(response);
    }
    catch(err){
        return res.send(400).send()
    }
})

app.put('/self',[dbCheck,checkAuth], async (req, res) => {
    const { password, first_name, last_name, username,...anythingelse } = req.body;

    if (username!=undefined ||( !password && !first_name && !last_name) || Object.keys(req.query).length != 0 ||Object.keys(anythingelse).length!=0) {
        return res.status(400).send();
    }
    try {
        const userForUpdation = await User.findOne({where:{username:req.username}})
        // reason for findOne is because on doing update with the where clause it runs builkUpdate hook which isn't required
        await userForUpdation.update({
                first_name: first_name?first_name:userForUpdation.first_name,
                last_name: last_name?last_name:userForUpdation.last_name,
                password: password?password:userForUpdation.password
            })
        return res.status(204).send();

    }
    catch (err) {
        // console.log(err);
        return res.status(400).send();
    }

})

app.post('/', dbCheck,async (req, res) => {
    if (req._body == false || req.get('Content-length') == undefined || Object.keys(req.query).length != 0) {
        return res.status(400).send();
    }
    else {
        const { first_name, last_name, username, password,...anythingelse} = req.body;
        switch (true) {
            case !first_name && !last_name && !username && !password:
                res.status(400).send({ message: "All fields required are missing in the body" });
                break;
            case !first_name:
                res.status(400).send({ message: "First name is missing in the body" });
                break;
            case !last_name:
                res.status(400).send({ message: "Last name is missing in the body" });
                break;
            case !username:
                res.status(400).send({ message: "Username is missing in the body" });
                break;
            case !password:
                res.status(400).send({ message: "Password is missing in the body" });
                break;
            case Object.keys(anythingelse).length!=0:
                res.status(400).send({message: "Other properties shouldn't be present"})
            default:
                try {
                    const emailCheck = await User.count({where:{username:username}});
                    if(emailCheck>0) return res.status(400).send({message:"Username already exists"});
                    await User.create({
                        first_name: first_name,
                        last_name: last_name,
                        username: username,
                        password: password,
                    });

                    return res.status(201).send();
                } catch (err) {
                    return res.status(400).send({
                        message: err.message,
                    });
                }
        }
    }
});

app.use((req, res) => {
    const allMethods = ["GET",'PUT','POST']
    if(allMethods.indexOf(req.method)==-1) return res.status(405).send();
    if (req.path == '/' && req.method != 'POST') return res.status(405).send();
    if (req.path == '/self' && (['GET', 'PUT'].indexOf(req.method) == -1)) return res.status(405).send();
    if(req.path.includes('/self') && ['GET','PUT'].indexOf(req.method)==-1 ) return res.status(405).send();
    return res.status(404).send()
})



module.exports = app;
