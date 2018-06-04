const moment = require('moment');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const dailyLogFileHelper = (label, level) => {

	const { timestamp, splat, simple, printf, prettyPrint, combine } = winston.format;

	const logFileOptions = {
		dirname: `logs/${label}`,
		filename: `%DATE%-${label}.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		format: combine(
			splat(), timestamp(), // simple(), prettyPrint()
			printf(({ level, timestamp, label, message, ...meta }) => {
				const time = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
				const json = JSON.stringify(meta, null, 2);
				return `${time} ${level}: ${message}\r\n${json}\r\n`;
			})
		)
	}

	return level
		? { ...logFileOptions, level }
		: logFileOptions;

}

const setupLogger = app => {

	const logger = winston.createLogger({
		level: 'info',
		transports: [
			// new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
			// new winston.transports.File({ filename: 'logs/combined.log' })
			new winston.transports.DailyRotateFile(dailyLogFileHelper('errors', 'error')),
			new winston.transports.DailyRotateFile(dailyLogFileHelper('combined', 'info'))
		],
		exceptionHandlers: [
			new winston.transports.DailyRotateFile(dailyLogFileHelper('exceptions'))
		]
	});

	if (process.env.NODE_ENV !== 'production') {
		logger.add(new winston.transports.Console({
			level: 'error',
			format: winston.format.simple()
		}));
	}

	app.set('APP_LOGGER', logger);

}

const getLogger = app => app.get('APP_LOGGER');

module.exports = {
	getLogger,
	setupLogger
};
