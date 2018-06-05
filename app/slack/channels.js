const _ = require('lodash');
const fs = require('fs');
const Config = require('../config');
const { getLogger, getSlackClients, getFilePointer } = require('../utils');

// Fetch the groups.json and channels.json files from the config.
const GROUPS_JSON_FILE = Config.files.groups;
const CHANNELS_JSON_FILE = Config.files.channels;

// Create a file descriptors for the groups.json and channels.json files.
const getGroupsFilePointer = getFilePointer(GROUPS_JSON_FILE);
const getChannelsFilePointer = getFilePointer(CHANNELS_JSON_FILE);

/**
 * Gets data about a public channel by ID from the channels.json file.
 * Returns undefined if no channel was found.
 *
 * @param {string} channelid The public channel ID
 */
const getChannelById = channelid => {
	// Get a pointer to the file and read JSON from it
	const channelsFile = getChannelsFilePointer('r');
	const { channels } = JSON.parse(fs.readFileSync(channelsFile).toString('utf8'));

	// Close the file pointer
	fs.closeSync(channelsFile);

	// Find the channel by ID and return the data
	return channels.find(channel => channel.id === channelid);
}

/**
 * Gets data about a private channel(group) by ID from the groups.json file.
 * Returns undefined if no channel was found.
 *
 * @param {string} groupid The private channel(group) ID
 */
const getGroupById = groupid => {
	// Get a pointer to the file and read JSON from it
	const groupsFile = getGroupsFilePointer('r');
	const { groups } = JSON.parse(fs.readFileSync(groupsFile).toString('utf8'));

	// Close the file pointer
	fs.closeSync(groupsFile);

	// Find the channel(group) by ID and return the data
	return groups.find(group => group.id === groupid);
}

/**
 * Fetches all the public channels in the Slack team and dumps specific data
 * about each of them into the channels.json file.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const fetchAllChannels = app => {

	// Get logger from app instance
	const logger = getLogger(app);

	// Get the Slack WebClient from app instance
	const { web: client } = getSlackClients(app) || {};

	client && client.channels.list()
		.then((res) => {

			const channels = [];
			const channelsFile = getChannelsFilePointer('w+');

			// `res` contains information about the channels
			// The collection of channels is contained in `res.channels`
			res.channels.forEach(channel => channels.push(
				_.pick(channel, [
					'id', 'name', 'is_channel', 'created', 'unlinked', 'is_archived', 'is_general', 'creator',
					'name_normalized', 'is_member', 'is_private', 'is_mpim', 'num_members'
				])
			));

			// update the channels.json file
			fs.writeFileSync(channelsFile, JSON.stringify({ channels }, null, '\t'));
			fs.closeSync(channelsFile);

			// Log channels update
			logger.info('Public channels updated successfully.', {
				file: CHANNELS_JSON_FILE,
				channels: channels.length
			});

		})
		.catch(err => logger.error('An error occurred while fetching public channels: %s', err));

}

/**
 * Fetches all the private channels(groups) in the Slack team and dumps specific data
 * about each of them into the groups.json file.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const fetchAllGroups = app => {

	// Get logger from app instance
	const logger = getLogger(app);

	// Get the Slack WebClient from app instance
	const { web: client } = getSlackClients(app) || {};

	client && client.groups.list()
		.then((res) => {

			const groups = [];
			const groupsFile = getGroupsFilePointer('w+');

			// `res` contains information about the groups
			// The collection of groups is contained in `res.groups`
			res.groups.forEach(group => groups.push(
				_.pick(group, [
					'id', 'name', 'is_group', 'created', 'is_archived', 'creator', 'is_mpim', 'name_normalized'
				])
			));

			// update the groups.json file
			fs.writeFileSync(groupsFile, JSON.stringify({ groups }, null, '\t'));
			fs.closeSync(groupsFile);

			// Log groups update
			logger.info('Private channels(groups) updated successfully.', {
				file: GROUPS_JSON_FILE,
				groups: groups.length
			});

		})
		.catch(err => logger.error('An error occurred while fetching private channels(groups): %s', err));
}

module.exports = {
	getGroupById,
	getChannelById,
	fetchAllGroups,
	fetchAllChannels
};
