const fs = require('fs');
const path = require('path');
const moment = require('moment');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const initialize = require('./app/init');
const { getFilePointer } = require('./app/utils');

const PORT = process.env.PORT || 3000;

// Create a new Express app
const app = express();

// Setup app configuration and middlewares
app.set('port', PORT);
app.use(bodyParser.json());

// Initialize the Express app
Promise.resolve(initialize(app))
	.then(() => {
		app.get('/logs/search', (req, res) => {

			const LOG_FILE = `logs/combined/${moment('2018-06-04').format('YYYY-MM-DD')}-combined.log`;

			const LOG_REGEX = /([\s\S]+?)(?=\r\n\n)/ig;
			const EXTRACT_REGEX = /^(?:[\s]*?)(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s([a-z]+):\s(.+)\r\n([\s\S]+?)$/i;

			const file = getFilePointer(path.resolve(__dirname, LOG_FILE))('r');
			const content = fs.readFileSync(file).toString('utf-8');

			let logs = content.match(LOG_REGEX);

			if (!logs) return res.json({ status: 'success', logs: [] });

			logs = logs.map(log => {
				const extracts = log.match(EXTRACT_REGEX);

				if (!extracts) return { log: log.trim() };

				const [, datetime, level, message, meta = '' ] = extracts;

				return {
					datetime, level, message,
					meta: JSON.parse(meta.replace(/([\s]*?)(?=[\{\}\"])/g, ''))
				};
			});

			return res.json({ status: 'success', logs });

		});
	})
	.then(() => {
		// Start the app - listening on the defined port
		app.listen(PORT, () => console.log(`Server started on ${PORT}`));
	});
