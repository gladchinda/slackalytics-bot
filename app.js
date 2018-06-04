const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const initialize = require('./helpers/init');

const PORT = process.env.PORT || 3000;

// Create a new Express app
const app = express();

// Setup app configuration and middlewares
app.set('port', PORT);
app.use(bodyParser.json());

// Initialize the Express app
initialize(app);

// Start the app - listening on the defined port
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
