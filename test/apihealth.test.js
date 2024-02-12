const request = require('supertest');
const app = require('../Routes/index')

describe("Health check ",() =>
test("get method for healthcheck",
async () => {
    const response = await request(app).get('/healthz');
    expect(response.statusCode).toBe(200);
}
));
