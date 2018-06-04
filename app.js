const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const initialize = require('./helpers/init');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('port', PORT);
app.use(bodyParser.json());

initialize(app);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
