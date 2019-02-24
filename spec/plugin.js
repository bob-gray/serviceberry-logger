"use strict";

const Request = require("serviceberry/src/Request"),
	httpMocks = require("node-mocks-http"),
	mock = require("mock-require");

mock("bunyan", {
	createLogger () {
		return {
			child () {
				return jasmine.createSpyObj("child", ["info"]);
			},
			addStream: Function.prototype
		};
	}
});

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
		request;

	Object.assign(incomingMessage, {
		setEncoding: Function.prototype,
		connection: {
			encrypted: true
		},
		socket: {
			remoteAddress: "0.0.0.0"
		}
	});
	request = new Request(incomingMessage);
	request.proceed = jasmine.createSpy("request.proceed");

	return request;
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
