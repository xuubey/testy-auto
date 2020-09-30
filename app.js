const bodyParser = require('body-parser');
const express = require('express');

const {respondNotFound} = require('./helper');
const todoApi = require('./todoApi');

const app = express();

app.set('x-powered-by', false);
app.use(bodyParser.json());


app.get('/', todoApi.list);
app.post('/', todoApi.create);
app.put('/:id', todoApi.change);
app.delete('/:id', todoApi.delete);
app.post('/:id/toggle', todoApi.toggle);


app.get('*', (req, res) => {
    respondNotFound(res);
});

app.use((error, req, res, next) => {
    console.log(error.stack);
    res.status(500);
    res.send(`
    We have encountered an error and we were notified about it. 
    We'll try to fix it as soon as possible!
    `)

});

exports.app = app;