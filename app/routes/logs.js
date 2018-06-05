const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const express = require('express');
const { getFilePointer } = require('../utils');

// Create an express Router instance
const router = express.Router();

// Resolve the app's root directory
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Endpoint: GET /:type/search/:date
 * Params: type, date
 * Query: from, to
 *
 * Fetch logs of the given log level(type).
 * Filter the results based on the given date and time range.
 */
router.get('/:type/search/:date', (req, res) => {

	// Fetch request query and params
	const { date, type } = req.params;
	const { from, to } = req.query;

	// Convert date param to moment
	const dateMoment = moment(date, ['YYYYMMDD', 'DDMMYYYY']);

	const allowedTypes = ['error', 'info'];
	const timeRegex = /^(?:[0-1]\d|2[0-3])[0-5]\d$/;

	// Check and resolve time range query params
	const toTime = timeRegex.test(to) ? +to : null;
	const fromTime = timeRegex.test(from) ? +from : null;
	const validTimeRange = fromTime && toTime && fromTime <= toTime;

	// Handle invalid log type error response
	if (!_.includes(allowedTypes, type.toLowerCase())) {
		return res.status(422).json({
			status: 'failed',
			error: 'BAD_REQUEST_PARAM',
			message: 'Unknown log request type. Required type is either `error` or `info`.'
		});
	}

	// Handle invalid date param error response
	if (!dateMoment.isValid()) {
		return res.status(422).json({
			status: 'failed',
			error: 'BAD_REQUEST_PARAM',
			message: 'The requested log date parameter is invalid. Required format is either YYYYMMDD or DDMMYYYY.'
		});
	}

	// Handle invalid time range error response
	if (!validTimeRange) {
		return res.status(422).json({
			status: 'failed',
			error: 'BAD_REQUEST_QUERY',
			message: 'The requested log time range is either invalid or malformed.'
		});
	}

	// Resolve log file based on date and log type
	const logLabel = type.toLowerCase() === 'error' ? 'errors' : 'combined';
	const LOG_FILE = `logs/${logLabel}/${dateMoment.format('YYYY-MM-DD')}-${logLabel}.log`;

	// Regex for extracting log lines from file
	const LOG_REGEX = /([\s\S]+?)(?=\r\n\n)/ig;

	// Regex for extracting log details from log line
	const EXTRACT_REGEX = /^(?:[\s]*?)(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s([a-z]+):\s(.+)\r\n([\s\S]+?)$/i;

	// Open and read the contents of the log file
	const file = getFilePointer(path.resolve(ROOT_DIR, LOG_FILE))('r');
	const content = fs.readFileSync(file).toString('utf-8');

	// Extract the log lines from the log file
	let logs = content.match(LOG_REGEX);

	// Handle empty log file response
	if (!logs) {
		return res.json({ status: 'success', logs: [] });
	}

	// Extract hrs and mins from the given time ranges
	const [ toHr, toMin ] = moment(to, 'HHmm').format('HH:mm').split(':');
	const [ fromHr, fromMin ] = moment(from, 'HHmm').format('HH:mm').split(':');

	// Get the exact from timestamp and to timestamp
	const toMoment = dateMoment.clone().set({ h: toHr, m: toMin }).unix();
	const fromMoment = dateMoment.clone().set({ h: fromHr, m: fromMin }).unix();

	logs = logs.map(log => {

		// Extract log details from log line
		const extracts = log.match(EXTRACT_REGEX);

		// Handle empty extracted data
		if (!extracts) return { log: log.trim() };

		const [, datetime, level, message, meta = ''] = extracts;

		// Return extracted data with proper parsing
		return {
			datetime, level, message,
			meta: JSON.parse(meta.replace(/([\s]*?)(?=[\{\}\"])/g, ''))
		};

	}).filter(({ datetime = null }) => {

		// Resolve timestamp from log datetime
		const dateMoment = moment(datetime);
		const timestamp = dateMoment.unix();

		// Verify that log falls within the required timestamp range
		return datetime && dateMoment.isValid() && timestamp >= fromMoment && timestamp <= toMoment;

	});

	// Return the final logs success response
	return res.json({ status: 'success', logs });

});

/**
 * Handle unknown requests on this router
 */
router.use((req, res) => {
	return res.status(404).json({
		status: 'failed',
		error: 'RESOURCE_NOT_FOUND',
		message: 'The requested resource could not be found on this server.'
	});
});

module.exports = router;
