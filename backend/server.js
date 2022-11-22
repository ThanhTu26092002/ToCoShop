require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 9000;

app.listen(PORT, () =>{
    console.log(`Example app listening on port ${PORT}`)
})

// process.on('SIGINT', () => {
//     server.close( () => console.log(`exits server express`))
// })
