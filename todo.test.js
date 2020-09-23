describe('', () => {

});
const todo = require('./todo');

let req;
let res;


function expectStatus(status) {
    if (status === 200) {
        return;
    }
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(status);
};

function expectResponce(json) {
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(json);
};

beforeEach(() => {
    req = {};
    res = {
        json: jest.fn(),
        status: jest.fn(),
    };
});

describe('list', () => {
    it('works', () => {
        todo.list(req, res);

        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith([
            {id: 1, name: 'Dinner', done: false},
            {id: 2, name: 'Dinner', done: false},
        ]);
    });
});

describe('create', () => {
    it('works', () => {
        req.body = {name: 'Lunch'};
        todo.create(req, res);

        expectResponce('Create: Lunch');
    });

    it('handles missing body', () => {
        todo.create(req, res);

        expectStatus(400);
        expectResponce({error: 'Name is missing'});
    });

    it('handles missing name in the body', () => {
        req.body = {};
        todo.create(req, res);

        expectStatus(400);
        expectResponce({error: 'Name is missing'});

    });

    it('handles an empty name', () => {
        req.body = {name: ' '};
        todo.create(req, res);

        expectStatus(400);
        expectResponce({error: 'Name should not be empty'});

    });

    it('handles an empty name (after trimming)', () => {
        req.body = {name: '   '};
        todo.create(req, res);

        expectStatus(400);
        expectResponce({error: 'Name should not be empty'});

    });

    it('handles wrong name type', () => {
        req.body = {name: 42};
        todo.create(req, res);

        expectStatus(400);
        expectResponce({error: 'Name should be a string'});

    });
});

describe('change', () => {

});
describe('delete', () => {

});

describe('toggle', () => {

});