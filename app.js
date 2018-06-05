const express = require('express');
const dotenv = require('dotenv').config();
const initialize = require('./app/init');

// Create a new Express app
const app = express();

// Setup app port
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// Initialize the Express app
Promise.resolve(initialize(app)).then(app => {
	// Start the app - listening on the defined port
	app.listen(PORT, () => console.log(`Server started on ${PORT}`));
});
