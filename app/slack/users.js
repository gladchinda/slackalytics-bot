const _ = require('lodash');
const fs = require('fs');
const Config = require('../config');
const { getLogger, getSlackClients, getFilePointer } = require('../utils');

// Fetch the users.json file from the config.
const USERS_JSON_FILE = Config.files.users;

// Creates a file descriptor for the users.json file.
const getUsersFilePointer = getFilePointer(USERS_JSON_FILE);

/**
 * Gets data about a user by ID from the users.json file.
 * Returns undefined if no user was found.
 *
 * @param {string} userid The user ID
 */
const getUserById = userid => {
	// Get a pointer to the file and read JSON from it
	const usersFile = getUsersFilePointer('r');
	const { users } = JSON.parse(fs.readFileSync(usersFile).toString('utf8'));

	// Close the file pointer
	fs.closeSync(usersFile);

	// Find the user by ID and return the data
	return users.find(user => user.id === userid);
}

/**
 * Fetches all the users in the Slack team and dumps specific data
 * about each of them into the users.json file.
 *
 * @param {Express.Application} app An instance of Express.Application
 */
const fetchAllUsers = app => {

	// Get logger from app instance
	const logger = getLogger(app);

	// Get the Slack WebClient from app instance
	const { web: client } = getSlackClients(app) || {};

	client && client.users.list()
		.then((res) => {

			const users = [];
			const usersFile = getUsersFilePointer('w+');

			// `res` contains information about the users.
			// The collection of users is contained in `res.members`
			res.members.forEach(user => users.push({
				...(_.pick(user, [
					'id', 'team_id', 'name', 'deleted', 'real_name', 'is_admin', 'is_owner', 'is_primary_owner',
					'is_restricted', 'is_ultra_restricted', 'is_bot', 'updated', 'is_app_user'
				])),
				email: user.profile.email
			}));

			// Update the users.json file
			fs.writeFileSync(usersFile, JSON.stringify({ users }, null, '\t'));
			fs.closeSync(usersFile);

			// Log users update
			logger.info('Users updated successfully.', {
				file: USERS_JSON_FILE,
				users: users.length
			});

		})
		.catch(err => logger.error('An error occurred while fetching users: %s', err));
}

module.exports = {
	getUserById,
	fetchAllUsers
};
