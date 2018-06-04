const qs = require('querystring');
const axios = require('axios');
const Config = require('./config');
const { getLogger } = require('./logger');

// Fetches the Google Analytics tracking ID from config
const ANALYTICS_ID = Config.analytics.id;

/**
 * Returns function that matches the given text against a regular expression
 * and returns the matches count.
 *
 * @param {string} text The text to match against
 */
const matchCount = text => regex => {
	const matches = text.match(regex);
	return (matches != null) ? matches.length : 0;
}

/**
 * Returns function that splits the given text against a regular expression
 * and returns the split count.
 *
 * @param {string} text The text to match against
 */
const splitCount = text => regex => {
	const fragments = text.split(regex);
	return (fragments != undefined) ? fragments.length : 0;
}

/**
 * Extracts metrics from the message data and pushes the metrics
 * to Google Analytics.
 *
 * @param {object} message The message data object
 */
const postMessageAnalytics = app => message => {

	// Get logger from app instance
	const logger = getLogger(app);

	// Extract message data to local variables
	const messageText = message.text;
	const { id: userID, name: userName, email: userEmail } = message.user;
	const { id: channelID, name: channelName } = message.channel;

	// Extract team domain from app instance
	const { domain: teamDomain } = app.get('SLACK_TEAM') || {};

	// Create match and split count functions for the message text
	const searchM = matchCount(messageText);
	const searchS = splitCount(messageText);

	// Extract the count metrics for the given message text
	const wordCount = searchS(/\s+\b/);
	const emojiCount = searchM(/:[a-z_0-9]*:/g);
	const exclamationCount = searchM(/!/g);
	const ellipsesCount = searchM(/\.{3}/g);
	const questionMarkCount = searchM(/\?/g);

	/**
	 * Analytics Data Structure
	 * The values line up with the indexes on Google Analytics
	 *
	 * cd{x} => custom dimension
	 * cm{x} => custom metric
	 */

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

	// Push the data to Google Analytics server
	axios.post(`https://www.google-analytics.com/collect?${qs.stringify(data)}`)
		.then(res => console.log('PUSHED'))
		.catch(err => logger.error('An error occurred while pushing metrics to Google Analytics: %s', err));

};

module.exports = {
	postMessageAnalytics
};
