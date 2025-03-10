import Express from 'express';

const app = Express();
app.use(Express.static('webapp'));

app.listen(8080);