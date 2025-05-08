 const express         = require('express');
const articlesRouter  = require('./routes/articles');
const app             = express();

app.use(express.json());
app.use('/articles', articlesRouter);

const PORT = 3004;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
