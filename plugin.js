"use strict";

const bunyan = require("bunyan"),
	{basename} = require("path");

function logger (path = "server.log") {
	const logger = createLogger(path);

	return (request, response) => {
		request.log = logger.child({
			id: request.getId()
		});

		request.log.info({
			ip: request.getIp(),
			method: request.getMethod(),
			host: request.getHeader("host"),
			url: request.getUrl().href
		}, "request");

		response.on("finish", () => {
			request.log.info({
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
	        name: basename(path, ".log"),
	        streams: [{
	            type: "rotating-file",
	            path: path,
	            period: "1d",
	            count: 5
	        }]
	    }
	}

	return bunyan.createLogger(options);
}

module.exports = logger;
