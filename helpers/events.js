const _ = require('lodash');
const { getLogger } = require('./logger');
const { postMessageAnalytics } = require('./analytics');
const { fetchAllUsers, getUserById } = require('./users');
const { fetchAllChannels, fetchAllGroups, getGroupById, getChannelById } = require('./channels');

/**
 * Helper function that returns a function for setting up event handlers for
 * a collection of events on the Realtime Messaging Client.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const bindAllEvents = app => (events = [], handler = f => f) => {

	// Get logger from app instance
	const logger = getLogger(app);
	const hasLogger = logger && logger.info;

	// Get Slack clients from the app instance
	const { rtm = null } = app.get('SLACK_CLIENTS') || {};

	// Register each collection event on the RtmClient
	rtm && events.forEach(event => {
		rtm.on(event, eventData => {
			// Log Slack event received
			hasLogger && logger.info('Received Slack event.', { event, data: eventData });

			// Delegate handling to the specified event handler
			_.isFunction(handler) && handler(eventData, app);
		});
	});

}

module.exports = app => {

	// Get Slack clients from the app instance
	const { web = null, rtm = null } = app.get('SLACK_CLIENTS') || {};

	if (rtm && web) {

		// Start the Realtime Messaging client
		rtm.start();

		// Bind to the app Slack clients
		const bindEvents = bindAllEvents(app);

		const channelEvents = [
			'channel_archive', 'channel_unarchive', 'channel_created', 'channel_deleted', 'channel_rename',
			'channel_joined', 'channel_left',
		];

		const groupEvents = [
			'group_archive', 'group_unarchive', 'group_open', 'group_close', 'group_rename', 'group_joined',
			'group_left'
		];

		const userEvents = [ 'user_change' ];

		const memberEvents = [ 'member_joined_channel', 'member_left_channel' ];

		const teamEvents = ['team_join', 'team_domain_change', 'team_rename'];

		// Add handler for message events
		rtm.on('message', event => {

			let { ...data } = event;

			// Extract data for the user and group/channel of the message
			const user = getUserById(data.user);
			const group = getGroupById(data.channel);
			const channel = getChannelById(data.channel);

			const hasSubtype = !!data.subtype;
			const isBotMessage = data.subtype && data.subtype === 'bot_message';
			const isFromThisBot = !data.subtype && data.user === rtm.activeUserId;
			const notChannelMember = !(group || (channel && channel.is_member));

			// Ignore message if tany of the conditions is met
			if (hasSubtype || notChannelMember || isBotMessage || isFromThisBot) return;

			// Update the message data with the user and channel information
			data = { ...data, user, channel: group || channel };

			// Extract and post the message data metrics to Google Analytics
			postMessageAnalytics(app)(data);

		});

		// Bind to different event collections
		bindEvents(channelEvents, (data, app) => fetchAllChannels(app));
		bindEvents(groupEvents, (data, app) => fetchAllGroups(app));
		bindEvents(userEvents, (data, app) => fetchAllUsers(app));
		bindEvents(memberEvents, (data,app) => fetchAllChannels(app));

	}

};
