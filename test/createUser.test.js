const request = require("supertest");
const app = require('../Routes/index.js');
const { get, post } = require("superagent");
const [globalUserCredentials]  = require('../config/testCredentials.js');

describe("Creating a user and get the user details to cross verify if it is the same user",()=>
test("Creating a new user and then get the credentials",async()=>{
    const postresponse =  (await request(app).post('/v1/user/')
    .send(globalUserCredentials)
    .set('Accept','application/json'))
    expect(postresponse.statusCode).toBe(201);
    expect(postresponse.body.username).toBe(globalUserCredentials.username)
    expect(postresponse.body.first_name).toBe(globalUserCredentials.first_name)
    expect(postresponse.body.last_name).toBe(globalUserCredentials.last_name)
    const getresponse = (await request(app)
    .get('/v1/user/self/')
    .set('Accept','application/json')
    .auth(globalUserCredentials.username,globalUserCredentials.password));
    expect(getresponse.statusCode).toBe(200)
   
    
}))
