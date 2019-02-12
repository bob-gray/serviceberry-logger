"use strict";

const {Writable} = require("stream"),
	{nameFromLevel, INFO, WARN, ERROR} = require("bunyan"),
	inspector = require("inspector"),
	{constructor: Chalk} = require("chalk"),
	{debug, info, warn, error} = inspector.console,
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
		const {level} = record,
			label = `[${nameFromLevel[level]}]`;

		if (level < INFO) {
			debug(gray(label), record);
		} else if (level < WARN) {
			info(blue(label), record);
		} else if (level < ERROR) {
			warn(black.bgYellow(label), record);
		} else {
			error(red(label), record);
		}

		callback();
	}
}

module.exports = InspectorConsoleStream;
