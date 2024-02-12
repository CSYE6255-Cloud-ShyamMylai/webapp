const request = require('supertest');
const app = require('../Routes/index')
const sequelize = require('../config/sequelize.js');
// Model and MySql config
const User = require('../models/User.js');
beforeAll(async () =>{
    await sequelize.authenticate();
    await User.sync();
})
describe("Health check ",() =>
test("get method for healthcheck",
async () => {
    const response = await request(app).get('/healthz');
    expect(response.statusCode).toBe(200);
}
));
