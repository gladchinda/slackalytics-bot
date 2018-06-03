const path = require('path');

module.exports = {

	files: {
		users: path.resolve(__dirname, '../.data/users.json'),
		channels: path.resolve(__dirname, '../.data/channels.json')
	},

	tokens: {
		slack: process.env.SLACK_ACCESS_TOKEN
	},

	analytics: {
		id: process.env.GOOG_ANALYTICS_TRACKING_ID
	}

};
