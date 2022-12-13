const express = require('express');
const routes = express.Router();
//Add routers
routes.use('/login',require('./routes/login'));
routes.use('/transportations',require('./routes/transportations'));
routes.use('/categories',require('./routes/categories'));
routes.use('/suppliers',require('./routes/suppliers'));
routes.use('/orders',require('./routes/orders'));
routes.use('/employees',require('./routes/employees'));
routes.use('/products',require('./routes/products'));
routes.use('/slides',require('./routes/slides'));
// routes.use('/uploadDemo',require('./routes/uploadDemo'));
// routes.use('/upload', require('./routes/upload'))



module.exports = routes;