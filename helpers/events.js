const _ = require('lodash');
const { postMessageAnalytics } = require('./analytics');
const { fetchAllUsers, getUserById } = require('./users');
const { fetchAllChannels, fetchAllGroups, getGroupById, getChannelById } = require('./channels');

/**
 * Helper function that returns a function for setting up event handlers for
 * a collection of events on the Realtime Messaging Client.
 *
 * @param {Slack.RtmClient} rtm An instance of Slack.RtmClient
 */
const bindAllEvents = rtm => (events = [], handler = f => f) => {
	events.forEach(event => ((_.isFunction(handler)) && rtm.on(event, handler)));
}

module.exports = app => {

	// Get Slack clients from the app instance
	const { web = null, rtm = null } = app.get('SLACK_CLIENTS') || {};

	if (rtm && web) {

		// Start the Realtime Messaging client
		rtm.start();

		// Bind to the RtmClient
		const bindEvents = bindAllEvents(rtm);

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
			data = { ...data, user, channel: group || channel }

			// Extract and post the message data metrics to Google Analytics
			postMessageAnalytics(app)(data);

		});

		// Bind to different event collections
		bindEvents(channelEvents, () => fetchAllChannels(app));
		bindEvents(groupEvents, () => fetchAllGroups(app));
		bindEvents(userEvents, () => fetchAllUsers(app));
		bindEvents(memberEvents, () => fetchAllChannels(app));

	}

};
