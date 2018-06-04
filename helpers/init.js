const { RTMClient, WebClient } = require('@slack/client');

const Config = require('./config');
const slackEvents = require('./events');
const { setupLogger } = require('./logger');
const { fetchAllUsers } = require('./users');
const { fetchAllChannels, fetchAllGroups } = require('./channels');

const SLACK_TOKEN = Config.tokens.slack;

const rtm = new RTMClient(SLACK_TOKEN);
const web = new WebClient(SLACK_TOKEN);

module.exports = app => {
	setupLogger(app);

	fetchAllUsers(web);
	fetchAllGroups(web);
	fetchAllChannels(web);

	slackEvents({ web, rtm });
};
