const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const Config = require('./helpers/config');
const { RTMClient, WebClient } = require('@slack/client');
const { fetchAllUsers, getUserById } = require('./helpers/users');
const { fetchAllChannels, fetchAllGroups, getGroupById, getChannelById } = require('./helpers/channels');

const PORT = process.env.PORT || 3000;
const SLACK_TOKEN = Config.tokens.slack;

const app = express();
const rtm = new RTMClient(SLACK_TOKEN);
const web = new WebClient(SLACK_TOKEN);

app.use(bodyParser.json());

rtm.start();

rtm.on('message', event => {

	let { ...data } = event;

	const user = getUserById(data.user);
	const group = getGroupById(data.channel);
	const	channel = getChannelById(data.channel);

	const hasSubtype = !!data.subtype;
	const isBotMessage = data.subtype && data.subtype === 'bot_message';
	const isFromThisBot = !data.subtype && data.user === rtm.activeUserId;
	const notChannelMember = !(group || (channel && channel.is_member));

	if (hasSubtype || notChannelMember || isBotMessage || isFromThisBot) return;

	data = { ...data, user, channel: group || channel }
	console.log(data);

});

fetchAllUsers(web);
fetchAllGroups(web);
fetchAllChannels(web);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
