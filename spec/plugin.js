"use strict";

const logger = require("../plugin"),
	Request = require("serviceberry/src/Request"),
	{HttpError} = require("serviceberry"),
	httpMocks = require("node-mocks-http");

describe("serviceberry-logger", () => {
	var request,
		response;

	beforeEach(() => {
		request = createRequest();
		response = createResponse();
	});

	it("should ...", () => {
		// TODO: mock bunyan and implement tests
	});
});

function createRequest (body) {
	var incomingMessage = httpMocks.createRequest({
			url: "/"
		}),
		request;

	incomingMessage.setEncoding = Function.prototype;
	request = new Request(incomingMessage);
	request.proceed = jasmine.createSpy("request.proceed");

	return request;
}

function createResponse (body) {
	var response = jasmine.createSpyObj("Response", [
		"on",
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
