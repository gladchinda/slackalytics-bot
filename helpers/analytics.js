const qs = require('querystring');
const axios = require('axios');
const Config = require('./config');

const ANALYTICS_ID = Config.analytics.id;

const matchCount = text => regex => {
	const matches = text.match(regex);
	return (matches != null) ? matches.length : 0;
}

const splitCount = text => regex => {
	const fragments = text.split(regex);
	return (fragments != undefined) ? fragments.length : 0;
}

const postMessageAnalytics = message => {

	const messageText = message.text;
	const { id: userID, name: userName, email: userEmail } = message.user;
	const { id: channelID, name: channelName } = message.channel;

	const teamDomain = message.team_domain;

	const searchM = matchCount(messageText);
	const searchS = splitCount(messageText);

	const wordCount = searchS(/\s+\b/);
	const emojiCount = searchM(/:[a-z_0-9]*:/g);
	const exclamationCount = searchM(/!/g);
	const ellipsesCount = searchM(/\.{3}/g);
	const questionMarkCount = searchM(/\?/g);


	// Structure Data
	// cd = custom dimension
	// cm = custom metric
	// values line up with index in GA

	const data = {
		v: 1,
		cid: userID,
		tid: ANALYTICS_ID,
		ds: 'slack', // data source
		cs: 'slack', // campaign source
		cd1: userID,
		cd2: channelName,
		cd3: `${userName} (${userEmail})`,
		cd4: messageText,
		cm1: wordCount,
		cm2: emojiCount,
		cm3: exclamationCount,
		cm4: ellipsesCount,
		cm5: questionMarkCount,
		dh: teamDomain + ".slack.com",
		dp: `/${channelName}`,
		dt: `Slack Channel: ${channelName}`,
		t: 'event',
		ec: `slack: ${channelName}|${channelID}`,
		ea: `post by ${userID}`,
		el: messageText,
		ev: 1
	};

	// console.log(JSON.stringify(data));

	axios.post(`https://www.google-analytics.com/collect?${qs.stringify(data)}`)
		.then(console.log)
		.catch(console.error);

};

module.exports = {
	postMessageAnalytics
};
