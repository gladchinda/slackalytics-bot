const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Config = require('./config');

const GROUPS_JSON_FILE = Config.files.groups;
const CHANNELS_JSON_FILE = Config.files.channels;

const getFilePointer = file => flag => {
	const dir = path.dirname(file);

	// create directory if it doesn't exist
	!fs.existsSync(dir) && fs.mkdirSync(dir);

	// return file pointer to the channels.json file
	return fs.openSync(file, flag);
}

const getGroupsFilePointer = getFilePointer(GROUPS_JSON_FILE);
const getChannelsFilePointer = getFilePointer(CHANNELS_JSON_FILE);

const getChannelById = channelid => {
	const channelsFile = getChannelsFilePointer('r');
	const { channels } = JSON.parse(fs.readFileSync(channelsFile).toString('utf8'));

	fs.closeSync(channelsFile);

	return channels.find(channel => channel.id === channelid);
}

const getGroupById = groupid => {
	const groupsFile = getGroupsFilePointer('r');
	const { groups } = JSON.parse(fs.readFileSync(groupsFile).toString('utf8'));

	fs.closeSync(groupsFile);

	return groups.find(group => group.id === groupid);
}

const fetchAllChannels = client => {
	client.channels.list()
		.then((res) => {

			const channels = [];
			const channelsFile = getChannelsFilePointer('w+');

			// `res` contains information about the channels
			res.channels.forEach(channel => channels.push(
				_.pick(channel, [
					'id', 'name', 'is_channel', 'created', 'unlinked', 'is_archived', 'is_general', 'creator',
					'name_normalized', 'is_member', 'is_private', 'is_mpim', 'num_members'
				])
			));

			// update the channels.json file
			fs.writeFileSync(channelsFile, JSON.stringify({ channels }, null, '\t'));
			fs.closeSync(channelsFile);

		})
		.catch(console.error);
}

const fetchAllGroups = client => {
	client.groups.list()
		.then((res) => {

			const groups = [];
			const groupsFile = getGroupsFilePointer('w+');

			// `res` contains information about the groups
			res.groups.forEach(group => groups.push(
				_.pick(group, [
					'id', 'name', 'is_group', 'created', 'is_archived', 'creator', 'is_mpim', 'name_normalized'
				])
			));

			// update the groups.json file
			fs.writeFileSync(groupsFile, JSON.stringify({ groups }, null, '\t'));
			fs.closeSync(groupsFile);

		})
		.catch(console.error);
}

module.exports = {
	getGroupById,
	getChannelById,
	fetchAllGroups,
	fetchAllChannels
};
