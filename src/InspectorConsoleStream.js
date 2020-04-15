"use strict";

const {Writable} = require("stream"),
	{nameFromLevel, INFO, WARN, ERROR} = require("bunyan"),
	toJSON = require("./toJSON"),
	inspector = require("inspector"),
	{Instance: Chalk} = require("chalk"),
	{debug, warn, error, info: log} = inspector.console,
	{gray, blue, black, red} = new Chalk({
		enabled: true,
		level: 1
	});

class InspectorConsoleStream extends Writable {
	constructor () {
		super({
			objectMode: true
		});
	}

	_write (record, encoding, callback) {
		const {level, msg} = record,
			label = `[${nameFromLevel[level]}]`;

		// objects written to stdout with console are JSON stringified
		// force any toJSON methods to be called
		// so output here is consistent with stdout
		record = toJSON(record);

		if (level < INFO) {
			debug(gray(label), msg, record);
		} else if (level < WARN) {
			info(blue(label), msg, record);
		} else if (level < ERROR) {
			warn(black.bgYellow(label), msg, record);
		} else {
			error(red(label), msg, record);
		}

		callback();
	}
}

function info (label, msg, record) {
	const {method, url, status} = record;

	if (msg === "request" && method && url) {
		log(label, `${method} ${url}`, record);
	} else if (msg === "response" && status) {
		log(label, `${status.code} ${status.text}`, record);
	} else {
		log(label, msg, record);
	}
}

module.exports = InspectorConsoleStream;
