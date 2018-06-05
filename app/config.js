const _ = require('lodash');
const path = require('path');

// Get prefix based on runtime environment
const development = process.env.NODE_ENV !== 'production';

// Environment-based prefix for config varaiable
const CONFIG_PREFIX = development ? 'TEST_' : 'LIVE_';

/**
 * Gets the value from an environment variable.
 * Returns null if the variable does not exist.
 *
 * @param {string} config Env variable name
 * @param {boolean} withPrefix Should add environment prefix
 */
const env = (config, withPrefix = false) => {
	// Ensure withPrefix is boolean defaulting to false
	withPrefix = _.isBoolean(withPrefix) && withPrefix;

	// Add prefix if config requires prefix
	withPrefix && (config = `${CONFIG_PREFIX}${config}`);

	const value = process.env[config];

	return value || null;
};

module.exports = {

	// App envirnonment details
	env: {
		dev: development,
		prefix: CONFIG_PREFIX
	},

	// Configuration keys for app instance
	configKeys: {
		team: 'SLACK_TEAM',
		logger: 'APP_LOGGER',
		clients: 'SLACK_CLIENTS'
	},

	// JSON files for caching users, groups and channels data
	files: {
		users: path.resolve(__dirname, '../.data/users.json'),
		groups: path.resolve(__dirname, '../.data/groups.json'),
		channels: path.resolve(__dirname, '../.data/channels.json')
	},

	tokens: {
		// Slack Access Token
		slack: env('SLACK_ACCESS_TOKEN', true)
	},

	analytics: {
		// Google Analytics Tracking ID
		id: env('GOOG_ANALYTICS_TRACKING_ID', true)
	}

};
