const path = require('path');

module.exports = {

	// JSON files for caching users, groups and channels data
	files: {
		users: path.resolve(__dirname, '../.data/users.json'),
		groups: path.resolve(__dirname, '../.data/groups.json'),
		channels: path.resolve(__dirname, '../.data/channels.json')
	},

	tokens: {
		// Slack Access Token
		slack: process.env.SLACK_ACCESS_TOKEN
	},

	analytics: {
		// Google Analytics Tracking ID
		id: process.env.GOOG_ANALYTICS_TRACKING_ID
	}

};
