const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = 3000;

const app = express();

const mongoose = require('mongoose');

const logger = require('morgan');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./config/swagger.config.js');
const dbConfig = require('./config/database.config.js');
const apiRouter = require('./app/routes/api.routes.js');
const webRouter = require('./app/routes/web.routes.js');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(logger('dev'));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, './app/views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

let swaggerSpec = swaggerJSDoc({
    swaggerDefinition,
    apis: ['./app/routes/index']
});

app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec)
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use('/', webRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});