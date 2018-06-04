const _ = require('lodash');
const { RTMClient, WebClient } = require('@slack/client');

const Config = require('./config');
const slackEvents = require('./events');
const { fetchAllUsers } = require('./users');
const { getLogger, setupLogger } = require('./logger');
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

	// Get logger from app instance
	const logger = getLogger(app);

	web.team.info()
		.then(res => {

			// Fetch the team information
			const team = _.pick(res.team, [ 'id', 'name', 'domain', 'email_domain' ]);

			// Set the team data on the app instance
			app.set('SLACK_TEAM', team);

			// Fetch and store users, groups and channels data
			fetchAllUsers(app);
			fetchAllGroups(app);
			fetchAllChannels(app);

			// Setup Slack realtime messaging events
			slackEvents(app);

		})
		.catch(err => logger.error('An error occurred while trying to fetch team information: %s', err));

};
