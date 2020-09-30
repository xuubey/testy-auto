const {connect, disconnect, drop} = require('./client');
const {getTodos, createTodo} = require('./db');
const todoApi = require('./todoApi');


let req;
let res;


function expectStatus(status) {
    if (status === 200) {
        return;
    }
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(status);
}

function expectResponse(json) {
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(json);
    expect(res.send).not.toHaveBeenCalled();
}

function expectTextResponse(json) {
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(json);
    expect(res.json).not.toHaveBeenCalled();
}

beforeAll(connect);
afterAll(disconnect);
beforeEach(drop);


beforeEach(() => {
    req = {
        params: {},
    };
    res = {
        json: jest.fn(),
        send: jest.fn(),
        status: jest.fn(),
    };
});

describe('list', () => {
    it('works', async () => {
        await todoApi.list(req, res);

        const todos = await getTodos();
        expectStatus(200);
        expectResponse(todos);
    });
});

describe('create', () => {
    it('works', async () => {
        const name = 'Supper';
        const {length} = await getTodos();
        req.body = {name};
        await todoApi.create(req, res);

        const todos = await getTodos();
        expectStatus(200);
        expect(todos).toHaveLength(length + 1);
        expectResponse(todos[todos.length - 1]);
        expect(todos[todos.length - 1]).toMatchObject({
            name,
            done: false,
        });
    });

    it('handles missing body', async () => {
        await todoApi.create(req, res);

        expectStatus(400);
        expectResponse({error: 'Name is missing'});
    });

    it('handles missing name in the body', async () => {
        req.body = {};
        await todoApi.create(req, res);

        expectStatus(400);
        expectResponse({error: 'Name is missing'});

    });

    it('handles an empty name', async () => {
        req.body = {name: ' '};
        await todoApi.create(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should not be empty'});

    });

    it('handles an empty name (after trimming)', async () => {
        req.body = {name: '   '};
        await todoApi.create(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should not be empty'});

    });

    it('handles wrong name type', async () => {
        req.body = {name: 42};
        await todoApi.create(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should be a string'});

    });
});

describe('change', () => {
    const id = 42;
    const name = 'Supper';
    const nextName = 'Lunch';

    it('works', async () => {
        todoApi.addTodo(await todoApi.createTodo(name, id));
        const {_id} = await createTodo(name);

        const {length} = await getTodos();
        req.params.id = id;
        req.body = {name: nextName};
        await todoApi.change(req, res);

        const todos = await getTodos();
        const todo = todos.find(todo => todo._id.equal(_id));
        expectStatus(200);
        expectResponse(todo);
        expect(todos).toHaveLength(length);
        expect(todo).toMatchObject({name: nextName});

    });

    it('handles missing todo', async () => {
        req.params.id = 'whatever';
        req.body = {name: nextName};
        await todoApi.change(req, res);

        expectStatus(404);
        expectResponse('Not found');
    });

    it('handles missing name in the body', async () => {
        req.params.id = id;
        req.body = {};
        await todoApi.change(req, res);

        expectStatus(400);
        expectResponse({error: 'Name is missing'});

    });

    it('handles an empty name', async () => {
        req.params.id = id;
        req.body = {name: ''};
        await todoApi.change(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should not be empty'});

    });

    it('handles an empty name (after trimming)', async () => {
        req.params.id = id;
        req.body = {name: '   '};
        await todoApi.change(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should not be empty'});

    });

    it('handles wrong name type', async () => {
        req.params.id = id;
        req.body = {name: 42};
        await todoApi.change(req, res);

        expectStatus(400);
        expectResponse({error: 'Name should be a string'});

    });
});


describe('delete', () => {
    const id = 42;
    const name = 'Supper';

    it('works', async () => {
        const todo = await createTodo(name);
        const {_id} = await getTodos();
        const {length} = await getTodos();
        req.params.id = todo._id;
        await todoApi.delete(req, res);

        const todos = await getTodos();
        expectStatus(200);
        expectResponse(todo);
        expect(todos).toHaveLength(length - 1);
    });

    it('handles missing todo', async () => {
        req.params.id = 'whatever';
        await todoApi.delete(req, res);

        expectStatus(404);
        expectTextResponse('Not found');
    });
});

describe('toggle', () => {
    const id = 42;

    it('works', async () => {
        const {_id} = await createTodo(name, false);
        const {length} = await getTodos();
        req.params.id = _id;
        req.body = {done: true}
        await todoApi.toggle(req, res);
        const todos = await getTodos();
        const todo = todos.find(todo => todo._id.equal(_id));


        expectStatus(200);
        expectResponse(todo);
        expect(todos).toHaveLength(length);
        expect(todo.done).toEqual(true);
    });

    it('works with toggling to false', async () => {
        const {_id} = await createTodo(name, true);
        const {length} = await getTodos();
        req.params.id = _id;
        req.body = {done: false}

        await todoApi.toggle(req, res);

        const todos = await getTodos();
        const todo = todos.find(todo => todo._id.equal(_id));
        expectStatus(200);
        expectResponse(todo);
        expect(todos).toHaveLength(length);
        expect(todo.done).toEqual(false);
    });

    it('handles missing todo', async () => {
        req.params.id = 'whatever';
        req.body = {done: true}
        await todoApi.toggle(req, res);

        expectStatus(404);
        expectTextResponse('Not found');
    });

    it('handles missing body', async () => {
        await todoApi.toggle(req, res);

        expectStatus(400);
        expectResponse({error: 'Done is missing'});
    });

    it('handles missing done in the body', async () => {
        req.body = {};
        await todoApi.toggle(req, res);

        expectStatus(400);
        expectResponse({error: 'Done is missing'});

    });

    it('handles an empty done', async () => {
        req.body = {name: ' '};
        await todoApi.toggle(req, res);

        expectStatus(400);
        expectResponse({error: 'Done should not be empty'});

    });

    it('handles wrong done type', async () => {
        req.body = {name: 42};
        await todoApi.toggle(req, res);

        expectStatus(400);
        expectResponse({error: 'Done should be a boolean'});

    });


});