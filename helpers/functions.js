const fs = require('fs');
const path = require('path');

/**
 * Returns a function for creating file descriptors for the given file
 * with the flag passed in as arguments.
 *
 * @param {string} file File path
 */
const getFilePointer = file => flag => {
	const dir = path.dirname(file);

	// create directory if it doesn't exist
	!fs.existsSync(dir) && fs.mkdirSync(dir);

	// return file pointer to the channels.json file
	return fs.openSync(file, flag);
}

module.exports = {
	getFilePointer
};
