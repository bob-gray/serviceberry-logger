/* eslint eqeqeq: ["error", "smart"] */

"use strict";

var objects;

function toJSON (value) {
	objects = new WeakMap();

	return transform(value);
}

// eslint-disable-next-line complexity
function transform (value) {
	var result;

	if (isObject(value) && objects.has(value)) {
		result = objects.get(value);
	} else {
		result = createResult(value);
	}

	return result;
}

function createResult (value) {
	var result,
		reference;

	if (value != null && typeof value.toJSON === "function") {
		result = value.toJSON();
	} else {
		result = value;
	}

	if (Array.isArray(result)) {
		reference = [];
		objects.set(value, reference);
		reference.push(...result.map(transform));
		result = reference;
	} else if (isObject(result) && Object.keys(result).length) {
		reference = {};
		objects.set(value, reference);
		Object.keys(result).forEach(name => {
			reference[name] = transform(result[name]);
		});
		result = reference;
	}

	return result;
}

function isObject (value) {
	return typeof value === "object" && value != null;
}

module.exports = toJSON;
