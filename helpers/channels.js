const fs = require('fs');
const path = require('path');
const Config = require('./config');

const CHANNELS_JSON_FILE = Config.files.channels;

const getChannelsFilePointer = flag => {
	const dir = path.dirname(CHANNELS_JSON_FILE);

	// create directory if it doesn't exist
	!fs.existsSync(dir) && fs.mkdirSync(dir);

	// return file pointer to the channels.json file
	return fs.openSync(CHANNELS_JSON_FILE, flag);
}

const getChannelById = channelID => {}

const fetchAllChannels = client => {
	client.channels.list()
		.then((res) => {

			const channels = [];
			const channelsFile = getChannelsFilePointer('w+');

			// `res` contains information about the channels
			res.channels.forEach(channel => channels.push(channel));

			// update the channels.json file
			fs.writeFileSync(channelsFile, JSON.stringify({ channels }, null, '\t'));
			fs.closeSync(channelsFile);

		})
		.catch(console.error);
}

module.exports = {
	getChannelById,
	fetchAllChannels,
	CHANNELS_JSON_FILE
};
