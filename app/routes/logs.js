const fs = require('fs');
const path = require('path');
const moment = require('moment');
const express = require('express');
const { getFilePointer } = require('../utils');

const router = express.Router();

const ROOT_DIR = path.resolve(__dirname, '../..');

router.get('/search', (req, res) => {

	const LOG_FILE = `logs/combined/${moment('2018-06-05').format('YYYY-MM-DD')}-combined.log`;

	const LOG_REGEX = /([\s\S]+?)(?=\r\n\n)/ig;
	const EXTRACT_REGEX = /^(?:[\s]*?)(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s([a-z]+):\s(.+)\r\n([\s\S]+?)$/i;

	const file = getFilePointer(path.resolve(ROOT_DIR, LOG_FILE))('r');
	const content = fs.readFileSync(file).toString('utf-8');

	let logs = content.match(LOG_REGEX);

	if (!logs) return res.json({ status: 'success', logs: [] });

	logs = logs.map(log => {
		const extracts = log.match(EXTRACT_REGEX);

		if (!extracts) return { log: log.trim() };

		const [, datetime, level, message, meta = ''] = extracts;

		return {
			datetime, level, message,
			meta: JSON.parse(meta.replace(/([\s]*?)(?=[\{\}\"])/g, ''))
		};
	});

	return res.json({ status: 'success', logs });

});

router.use((req, res) => {
	return res.status(404).json({
		status: 'failed',
		error: 'RESOURCE_NOT_FOUND',
		message: 'The requested resource could not be found on this server.'
	});
});

module.exports = router;
