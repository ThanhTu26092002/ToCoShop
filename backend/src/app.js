require('dotenv').config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const logger = require('./v1/utils/logger');
const {v4: uuid} = require('uuid');


const MONGO_URL = process.env.MONGO_URL;
mongoose
  .connect(MONGO_URL, {
    // serverSelectionTimeoutMS: 3000,
  })
  .then((result) => logger.log('info',"Database connection Success"))
  .catch((err) => logger.log('error', `Database connection failed: ${err}`));

//user middleware
app.use(helmet());
app.use(morgan("combined"));

//add body-parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//router
app.use('/v1', require("./v1"))

//Error Handling Middleware called

app.use((req, res, next) => {
  const error = new Error("Not found!");
  error.status = 404;
  next(error);
});

//error handler middleware

app.use((error, req, res, next) => {
  logger.log('error', `${uuid()}----${req.url}-----${req.method}-----${error.message}`);
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

module.exports = app;
