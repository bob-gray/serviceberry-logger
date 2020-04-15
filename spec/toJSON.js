/* eslint-env jasmine */

"use strict";

const toJSON = require("../src/toJSON");

describe("toJSON", () => {
	var source;

	beforeEach(() => {
		source = {
			foo: 5,
			nada: null,
			baz: true,
			pat: /test/,
			func: () => {
				// ignore
			},
			time: {
				jazz: "hello",
				toJSON: () => "time"
			},
			deep: {
				deeper: {
					toJSON: () => null
				}
			}
		};
	});

	it("should tranform an object without mutating it", () => {
		const control = source.deep.deeper;

		toJSON(source);

		expect(control).toBe(source.deep.deeper);
	});

	it("should call toJSON method of each property that has one", () => {
		expect(toJSON(source)).toEqual({
			foo: 5,
			nada: null,
			baz: true,
			pat: /test/,
			func: source.func,
			time: "time",
			deep: {
				deeper: null
			}
		});
	});

	it("should be circular reference safe", () => {
		source.deep.source = source;

		expect(() => toJSON(source)).not.toThrow();
	});
});
