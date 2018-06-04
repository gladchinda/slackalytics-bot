const _ = require('lodash');
const { postMessageAnalytics } = require('./analytics');
const { fetchAllUsers, getUserById } = require('./users');
const { fetchAllChannels, fetchAllGroups, getGroupById, getChannelById } = require('./channels');

const bindAllEvents = rtm => (events = [], handler = f => f) => {
	events.forEach(event => ((_.isFunction(handler)) && rtm.on(event, handler)));
}

module.exports = clients => {

	const { web = null, rtm = null } = clients || {};

	if (rtm && web) {

		rtm.start();

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

		rtm.on('message', event => {

			let { ...data } = event;

			const user = getUserById(data.user);
			const group = getGroupById(data.channel);
			const channel = getChannelById(data.channel);

			const hasSubtype = !!data.subtype;
			const isBotMessage = data.subtype && data.subtype === 'bot_message';
			const isFromThisBot = !data.subtype && data.user === rtm.activeUserId;
			const notChannelMember = !(group || (channel && channel.is_member));

			if (hasSubtype || notChannelMember || isBotMessage || isFromThisBot) return;

			data = { ...data, user, channel: group || channel }
			postMessageAnalytics(data);

		});

		bindEvents(channelEvents, () => fetchAllChannels(web));
		bindEvents(groupEvents, () => fetchAllGroups(web));
		bindEvents(userEvents, () => fetchAllUsers(web));
		bindEvents(memberEvents, () => fetchAllChannels(web));

	}

};
