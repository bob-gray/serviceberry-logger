"use strict";

const bunyan = require("bunyan"),
	{promisify} = require("util"),
	{dirname, basename} = require("path"),
	InspectorConsoleStream = require("./InspectorConsoleStream"),
	mkdirp = promisify(require("mkdirp")),
	thousandths = 3;

async function plugin (path = "logs/service.log") {
	const logger = await createLogger(path);

	return (request, response) => {
		request.log = logger.child({
			id: request.getId()
		});

		request.log.info({
			ip: request.getIp(),
			method: request.getMethod(),
			host: request.getHost(),
			url: request.getFullUrl(),
			headers: request.getHeaders()
		}, "request");

		response.on("finish", () => {
			request.log.info({
				elapsed: request.getElapsedTime().toFixed(thousandths),
				status: response.getStatus(),
				headers: response.getHeaders()
			}, "response");
		});

		request.proceed();
	};
}

plugin.error = request => {
	request.log.error(request.error);

	throw request.error;
};

async function createLogger (path) {
	var options,
		logger;

	if (typeof path === "object") {
		options = path;
	} else {
		await mkdirp(dirname(path));

		options = {
			name: basename(path, ".log"),
			streams: [{
				type: "rotating-file",
				path: path,
				period: "1d",
				count: 5
			}]
		};
	}

	logger = bunyan.createLogger(options);

	if (process.env.NODE_ENV !== "production") {
		logger.addStream({
			name: "console",
			type: "raw",
			stream: new InspectorConsoleStream(),
			closeOnExit: false
		});
	}

	return logger;
}

module.exports = plugin;
