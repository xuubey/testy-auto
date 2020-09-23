const request = require('supertest');

const {app} = require('./app');


it('works with create a todo', async () => {
    const response = await request(app).post('/');

    expect(response.status).toEqual(400);
});

it('handles pages that are not found', async () => {
    const response = await request(app).get('/whatever');

    expect(response.status).toEqual(404);
    expect(response.text).toEqual('Not found');
});
