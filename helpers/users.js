const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Config = require('./config');

const USERS_JSON_FILE = Config.files.users;

const getUsersFilePointer = flag => {
	const dir = path.dirname(USERS_JSON_FILE);

	// create directory if it doesn't exist
	!fs.existsSync(dir) && fs.mkdirSync(dir);

	// return file pointer to the users.json file
	return fs.openSync(USERS_JSON_FILE, flag);
}

const getUserById = userid => {
	const usersFile = getUsersFilePointer('r');
	const { users } = JSON.parse(fs.readFileSync(usersFile).toString('utf8'));

	fs.closeSync(usersFile);

	return users.find(user => user.id === userid);
}

const fetchAllUsers = client => {
	client.users.list()
		.then((res) => {

			const users = [];
			const usersFile = getUsersFilePointer('w+');

			// `res` contains information about the users
			res.members.forEach(user => users.push({
				...(_.pick(user, [
					'id', 'team_id', 'name', 'deleted', 'real_name', 'is_admin', 'is_owner', 'is_primary_owner',
					'is_restricted', 'is_ultra_restricted', 'is_bot', 'updated', 'is_app_user'
				])),
				email: user.profile.email
			}));

			// update the users.json file
			fs.writeFileSync(usersFile, JSON.stringify({ users }, null, '\t'));
			fs.closeSync(usersFile);

		})
		.catch(console.error);
}

module.exports = {
	getUserById,
	fetchAllUsers,
	USERS_JSON_FILE
};
