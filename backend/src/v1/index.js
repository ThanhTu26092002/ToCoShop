const express = require('express');
const routes = express.Router();
//Add routers
routes.use('/logins',require('./routes/login'));
routes.use('/transportations',require('./routes/transportations'));
routes.use('/categories',require('./routes/categories'));
routes.use('/suppliers',require('./routes/suppliers'));
routes.use('/orders',require('./routes/orders'));
// routes.use('/uploadDemo',require('./routes/uploadDemo'));

// routes.use('/upload', require('./routes/upload'))




module.exports = routes;