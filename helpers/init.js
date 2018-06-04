const { RTMClient, WebClient } = require('@slack/client');

const Config = require('./config');
const slackEvents = require('./events');
const { setupLogger } = require('./logger');
const { fetchAllUsers } = require('./users');
const { fetchAllChannels, fetchAllGroups } = require('./channels');

// Fetch Slack Access Token from config
const SLACK_TOKEN = Config.tokens.slack;

module.exports = app => {

	// Setup logger for Express app
	setupLogger(app);

	// Create Slack clients
	const rtm = new RTMClient(SLACK_TOKEN);
	const web = new WebClient(SLACK_TOKEN);

	// Set Slack clients on app instance
	app.set('SLACK_CLIENTS', { web, rtm });

	// Fetch and store users, groups and channels data
	fetchAllUsers(app);
	fetchAllGroups(app);
	fetchAllChannels(app);

	// Setup Slack realtime messaging events
	slackEvents(app);

};
