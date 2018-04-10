"use strict";

const bunyan = require("bunyan"),
	path = require("path");

function logger (path = "server.log") {
	const logger = createLogger(path);

	return (request, response) => {
		request.log = logger.child({id});

		request.log({
			ip: request.getIp(),
			method: request.getMethod(),
			host: request.getHeader("host"),
			url: request.getUrl().href
		}, "request");

		response.on("finish", () => {
			request.log({
				elapsed: request.getElapsedTime().toFixed(3),
				status: response.getStatus(),
				headers: response.getHeaders()
			}, "response");
		});

		request.proceed();
	};
};

logger.error = request => {
	request.log.error(request.error);

	throw request.error;
};

function createLogger (path) {
	var options;

	if (typeof path === "object") {
		options = path;
	} else {
		options = {
	        name: path.basename(path, ".log"),
	        stream: {
	            type: "rotating-file",
	            path: path,
	            period: "1d",
	            count: 5
	        }
	    }
	}

	return bunyan.createLogger(options);
}

module.exports = logger;
