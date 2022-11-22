const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');


//user middleware
app.use(helmet());
app.use(morgan('combined'));


//add body-parser
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//router
app.use(require)