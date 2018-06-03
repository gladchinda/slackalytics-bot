const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const Config = require('./helpers/config');
const { RTMClient, WebClient } = require('@slack/client');
// const { createSlackEventAdapter } = require('@slack/events-api');
const { fetchAllChannels } = require('./helpers/channels');

const PORT = process.env.PORT || 3000;
const SLACK_TOKEN = Config.tokens.slack;

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

fetchAllChannels(web);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
