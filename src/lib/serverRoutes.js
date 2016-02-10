'use strict';

module.exports = function(server, method, path, handler) {
	server.route({
		method: method,
		path: path,
		handler: handler
	});
};
