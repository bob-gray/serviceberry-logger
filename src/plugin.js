"use strict";

const bunyan = require("bunyan"),
	{promisify} = require("util"),
	{dirname, basename} = require("path"),
	InspectorConsoleStream = require("./InspectorConsoleStream"),
	mkdirp = promisify(require("mkdirp"));

class Logger {
	constructor (options = {}) {
		return this.init(options);
	}

	async init (options) {
		this.log = await createLogger(options);

		Object.freeze(this);

		return this;
	}

	use (request, response) {
		Object.defineProperty(request, "log", {
			configurable: false,
			enumerable: true,
			writable: false,
			value: this.log.child({
				id: request.getId()
			})
		});

		request.log.info({
			ip: request.getIp(),
			method: request.getMethod(),
			host: request.getHost(),
			url: request.getFullUrl(),
			headers: request.getHeaders()
		}, "request");

		response.once("finish", () => {
			request.log.info({
				elapsed: request.getElapsedTime(),
				status: response.getStatus(),
				headers: response.getHeaders()
			}, "response");
		});

		request.proceed();
	}

	error (request) {
		request.log.error(request.error);

		throw request.error;
	}
}

Object.freeze(Object.setPrototypeOf(Logger.prototype, null));

function plugin (options) {
	return new Logger(options);
}

Object.defineProperties(plugin, {
	Logger: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Logger
	},
	error: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: Logger.prototype.error
	}
});

async function createLogger (options) {
	var logger = bunyan.createLogger(await expandOptions(options));

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

async function expandOptions (options) {
	var path;

	if (typeof options === "string") {
		path = options;

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

	if (options.stream && options.stream.path) {
		await makeDirectory(options.stream);
	}

	if (options.streams) {
		await Promise.all(options.streams.filter(hasPath).map(makeDirectory));
	}

	return options;
}

function hasPath (stream) {
	return stream.path;
}

function makeDirectory (stream) {
	return mkdirp(dirname(stream.path));
}

module.exports = plugin;
