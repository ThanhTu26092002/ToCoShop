const express = require('express');
const routes = express.Router();
//Add routers
routes.use('/categories',require('./routes/categories'));
routes.use('/uploadDemo',require('./routes/uploadDemo'));

// routes.use('/upload', require('./routes/upload'))




module.exports = routes;