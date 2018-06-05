const logsRouter = require('./logs');

/**
 * Mount routers on Express app instance.
 * @param {Express.Application} app An instance of Express.Application
 */
module.exports = app => {
	app.use('/logs', logsRouter);
	return app;
};
