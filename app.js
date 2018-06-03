const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const { RTMClient, WebClient } = require('@slack/client');
// const { createSlackEventAdapter } = require('@slack/events-api');

const PORT = process.env.PORT || 3000;
const SLACK_TOKEN = process.env.SLACK_ACCESS_TOKEN;

const USERS_FILE = '.data/users.json';
const CHANNELS_FILE = '.data/channels.json';

const app = express();
const rtm = new RTMClient(SLACK_TOKEN);
const web = new WebClient(SLACK_TOKEN);
// const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);

app.use(bodyParser.json());

// app.use('/slack/message', slackEvents.expressMiddleware());

// slackEvents.on('message', event => {
// 	// console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
// 	console.log(event);
// });

// slackEvents.on('error', console.error);

// rtm.start();

// rtm.on('message', event => {

	// const isBotMessage = message.subtype && message.subtype === 'bot_message';
	// const isFromThisBot = !message.subtype && message.user === rtm.activeUserId;

	// if (isBotMessage || isFromThisBot) return;

	// console.log(event);

// });

const updateChannels = client => {
	client.channels.list()
		.then((res) => {
			// const content = fs.readFileSync('data/channels.json').toString('utf8');
			// const channels = JSON.parse(content).channels;
			const channels = [];

			// `res` contains information about the channels
			res.channels.forEach(channel => channels.push(channel));

			// update the channels.json file
			fs.writeFileSync(CHANNELS_FILE, JSON.stringify({ channels }, null, '\t'));
		})
		.catch(console.error);
}

updateChannels(web);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
