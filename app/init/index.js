const _ = require('lodash');
const bodyParser = require('body-parser');
const { RTMClient, WebClient } = require('@slack/client');

const Config = require('../config');
const { getLogger } = require('../utils');
const setupAppRoutes = require('../routes');
const setupAppLogger = require('../logger');
const setupSlackEvents = require('../slack/events');
const { fetchAllUsers } = require('../slack/users');
const { fetchAllChannels, fetchAllGroups } = require('../slack/channels');

module.exports = app => {

	// Setup app middlewares
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Setup logger for Express app
	setupAppLogger(app);

	// Mount app routes on app instance
	setupAppRoutes(app);

	// Fetch Slack Access Token from config
	const SLACK_TOKEN = Config.tokens.slack;

	// Get Slack config keynames from config
	const SLACK_TEAM = Config.configKeys.team;
	const SLACK_CLIENTS = Config.configKeys.clients;

	// Create Slack clients
	const rtm = new RTMClient(SLACK_TOKEN);
	const web = new WebClient(SLACK_TOKEN);

	// Set Slack clients on app instance
	app.set(SLACK_CLIENTS, { web, rtm });

	// Get logger from app instance
	const logger = getLogger(app);

	return web.team.info()
		.then(res => {

			// Fetch the team information
			const team = _.pick(res.team, [ 'id', 'name', 'domain', 'email_domain' ]);

			// Set the team data on the app instance
			app.set(SLACK_TEAM, team);

			// Fetch and store users, groups and channels data
			fetchAllUsers(app);
			fetchAllGroups(app);
			fetchAllChannels(app);

			// Setup Slack realtime messaging events
			setupSlackEvents(app);

		})
		.then(() => app)
		.catch(err => logger.error('An error occurred while trying to fetch team information: %s', err));

};
