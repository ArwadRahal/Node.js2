//Arwad Rahal & Ayman Zeed
const express = require('express');
const bodyParser = require('body-parser');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
