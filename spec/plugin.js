"use strict";

const Request = require("serviceberry/src/Request"),
	httpMocks = require("node-mocks-http"),
	mock = require("mock-require");

mock("winston", {
	config: {
		npm: {
			levels: {
				error: 0,
				warn: 1,
				info: 2,
				verbose: 3,
				debug: 4,
				silly: 5
			}
		}
	},
	transports: {
		Console: class Console {}
	},
	format: {
		combine: Function.prototype,
		timestamp: Function.prototype,
		json: Function.prototype
	},
	createLogger () {
		return {
			child () {
				return jasmine.createSpyObj("child", ["info"]);
			}
		};
	}
});

mock("winston-transport", class Transport {});
mock("winston-daily-rotate-file", class DailyRotateFile {});

var logger = require("../src/plugin");

describe("serviceberry-logger", () => {
	var request,
		response,
		log;

	beforeEach(async () => {
		log = await logger({
			name: "test"
		});
		request = createRequest();
		response = createResponse();
	});

	it("should log the request", async () => {
		log.use(request, response);

		expect(request.log.info).toHaveBeenCalled();
	});
});

function createRequest () {
	var incomingMessage = httpMocks.createRequest({
			url: "/"
		}),
		request = new Request(Object.assign(incomingMessage, {
			setEncoding: Function.prototype,
			connection: {
				encrypted: true
			},
			socket: {
				remoteAddress: "0.0.0.0"
			}
		}));

	return new Proxy(request, {
		get (target, name, receiver) {
			var value;

			if (name === "proceed") {
				value = jasmine.createSpy("request.proceed");
			} else {
				value = Reflect.get(target, name, receiver);
			}

			if (typeof value === "function") {
				value = value.bind(target);
			}

			return value;
		}
	});
}

function createResponse () {
	var response = jasmine.createSpyObj("Response", [
		"once",
		"getStatus",
		"getHeaders"
	]);

	response.getStatus.and.returnValue({
		code: 200,
		text: "OK"
	});

	response.getHeaders.and.returnValue({
		"Content-Type": "text/plain"
	});

	return response;
}
