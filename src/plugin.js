"use strict";

const {
		format: {combine, timestamp, json},
		transports: {Console},
		...winston
	} = require("winston"),
	DailyRotateFile = require("winston-daily-rotate-file"),
	{dirname, basename} = require("path"),
	InspectorConsoleTransport = require("./InspectorConsoleTransport"),
	mkdirp = require("mkdirp"),
	NODE_ENV = process.env;

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
			message: "request",
			ip: request.getIp(),
			method: request.getMethod(),
			host: request.getHost(),
			url: request.getFullUrl(),
			headers: request.getHeaders()
		});

		response.once("finish", () => {
			request.log.info({
				message: "response",
				elapsed: request.getElapsedTime(),
				status: response.getStatus(),
				headers: response.getHeaders()
			});
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
	var level,
		transports = [];

	if (typeof options === "string") {
		options = {
			path: options
		};
	}

	if (options.path) {
		await makeDirectory(options.path);

		transports.push(new DailyRotateFile({
			filename: basename(options.path, ".log") + "%DATE%.log",
			dirname: dirname(options.path),
			maxFiles: 5
		}));

		delete options.path;
	}

	if (NODE_ENV !== "production") {
		level = "silly";
		transports.push(new InspectorConsoleTransport());
	}

	transports.push(new Console());

	return winston.createLogger({
		level,
		transports,
		defaultMeta: {
			...options
		},
		format: combine(
			{
				transform (record) {
					if (record.originalError instanceof Error) {
						delete record.originalError;
					}

					return record;
				}
			},
			timestamp(),
			json()
		)
	});
}

function makeDirectory (path) {
	return mkdirp(dirname(path));
}

module.exports = plugin;
