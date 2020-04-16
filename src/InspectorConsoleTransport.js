"use strict";

const Transport = require("winston-transport"),
	levels = require("winston").config.npm.levels,
	{INFO, WARN, ERROR} = formatLevels(),
	inspector = require("inspector"),
	{Instance: Chalk} = require("chalk"),
	{debug, warn, error, info: log} = inspector.console,
	{gray, blue, black, red} = new Chalk({
		enabled: true,
		level: 1
	});

class InspectorConsoleTransport extends Transport {
	log (record, callback) {
		const {message} = record,
			level = levels[record.level],
			label = `[${record.level}]`;

		record = prepare(record);

		if (level > INFO) {
			debug(gray(label), message, record);
		} else if (level > WARN) {
			info(blue(label), message, record);
		} else if (level > ERROR) {
			warn(black.bgYellow(label), message, record);
		} else {
			error(red(label), message, record);
		}

		callback();
	}
}

function info (label, message, record) {
	const {method, url, status} = record;

	if (message === "request" && method && url) {
		log(label, `${method} ${url}`, record);
	} else if (message === "response" && status) {
		log(label, `${status.code} ${status.text}`, record);
	} else {
		log(label, message, record);
	}
}

function prepare (record) {
	const properties = Object.getOwnPropertyDescriptors(record);

	return Object.create(
		null,
		Object.getOwnPropertyNames(properties)
			.filter(name => properties[name].enumerable)
			.reduce((props, name) => {
				props[name] = properties[name];

				return props;
			}, {})
	);
}

function formatLevels () {
	return ["info", "warn", "error"].reduce((values, name) => {
		values[name.toUpperCase()] = levels[name];

		return values;
	}, {});
}

module.exports = InspectorConsoleTransport;
