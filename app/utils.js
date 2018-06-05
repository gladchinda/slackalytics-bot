const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Config = require('./config');

/**
 * Returns a function that gets the value from an environment variable.
 * A default value or null is returned if the variable does not exist.
 *
 * @param {boolean} withPrefix Should add environment prefix
 */
const _env = (withPrefix = false) => (config, defaultValue = null) => {
	// Ensure withPrefix is boolean defaulting to false
	withPrefix = _.isBoolean(withPrefix) && withPrefix;

	// Get environment prefix from config
	const CONFIG_PREFIX = Config.env.prefix || [];

	// Add prefix if config requires prefix
	withPrefix && (config = `${CONFIG_PREFIX}${config}`);

	const value = process.env[config];

	// Return config value or defaultValue
	return value || defaultValue || null;
};

// Create env functions
const env = _env(false);
const envWithPrefix = _env(true);

/**
 * Get config by key from the Express app instance.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const _app = app => key => {
	// Get app config keyname from config
	const keyname = Config.configKeys[key];
	return keyname ? app.get(keyname) : null;
}

/**
 * Get logger from the Express app instance.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const getLogger = app => _app(app)('logger');

/**
 * Get the Slack team from the Express app instance.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const getSlackTeam = app => _app(app)('team');

/**
 * Get the Slack clients from the Express app instance.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const getSlackClients = app => _app(app)('clients');

/**
 * Returns a function for creating file descriptors for the given file
 * with the flag passed in as arguments.
 *
 * @param {string} file File path
 */
const getFilePointer = file => flag => {
	const dir = path.dirname(file);

	// create directory if it doesn't exist
	!fs.existsSync(dir) && fs.mkdirSync(dir);

	// return file pointer to the channels.json file
	return fs.openSync(file, flag);
}

module.exports = {
	env,
	envWithPrefix,
	getLogger,
	getSlackTeam,
	getSlackClients,
	getFilePointer
};
