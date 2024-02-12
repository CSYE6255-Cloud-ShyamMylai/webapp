const request = require("supertest");
const app = require('../Routes/index.js');
const {get,put} = require("superagent");
const [globalUserCredentials,newpassword] = require('../config/testCredentials.js');
const sequelize = require('../config/sequelize.js');
// Model and MySql config
const User = require('../models/User.js');
describe("Updating a user and get the user details to cross verify if it is the same user",()=>{
    test("Updating a user's last name and then get the credentials",async ()=>{
        // console.log(globalUserCredentials)
        const putResponse = await request(app).put('/v1/user/self/')
        .auth(globalUserCredentials.username,globalUserCredentials.password)
        .send({first_name:"Testing"})
        .set({'content-type':'application/json'})
        expect(putResponse.statusCode).toBe(204);
        const getResponse = (await request(app).get('/v1/user/self/')
        .auth(globalUserCredentials.username,globalUserCredentials.password)
        .set('Accept','application/json'));
        expect(getResponse.statusCode).toBe(200)
        expect(getResponse.body.first_name).toBe("Testing");
    })

    test("Updating a user's first name and then get the credentials",async ()=>{
        // console.log(globalUserCredentials)
        const putResponse = await request(app).put('/v1/user/self/')
        .auth(globalUserCredentials.username,globalUserCredentials.password)
        .send({last_name:"Testing Last Name"})
        .set({'content-type':'application/json'})
        expect(putResponse.statusCode).toBe(204);

        const getResponse = (await request(app).get('/v1/user/self/')
        .auth(globalUserCredentials.username,globalUserCredentials.password)
        .set('Accept','application/json'));
        expect(getResponse.statusCode).toBe(200)
        expect(getResponse.body.last_name).toBe("Testing Last Name");
    })

    test("Updating a user's password and then get the credentials",async ()=>{
        // console.log(globalUserCredentials)
        const putResponse = await request(app).put('/v1/user/self/')
        .auth(globalUserCredentials.username,globalUserCredentials.password)
        .send({password:newpassword})
        .set({'content-type':'application/json'})
        expect(putResponse.statusCode).toBe(204);

        const getResponse = (await request(app).get('/v1/user/self/')
        .auth(globalUserCredentials.username,newpassword)
        .set('Accept','application/json'));
        expect(getResponse.statusCode).toBe(200);
    })
})

afterAll(async()=>{
    await sequelize.close();
});
    