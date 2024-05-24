const fs = require('fs');
const parser = require('@asyncapi/parser');
var toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');
const {JSONPath} = require('jsonpath-plus');
const { stringify } = require('querystring');

function AsyncApiLoad(serviceName, asyncApiUri) {
	this.asyncApiStr = fs.readFileSync(asyncApiUri, 'utf8');
	this.apiContract = null;
	this.tmpUri = './tmp/';
}

AsyncApiLoad.prototype.resolve = async function(messageId) {

	return parser.parse(this.asyncApiStr).then(asyncApi => {

		this.apiContract = asyncApi['_json'];
		// console.log(this.apiContract);
		let headers = this.getHeaders(messageId);
		let payload = this.getPayload(messageId);

		var config = {[messageId]:{
			request: {
				headers: headers,
				payload: payload
			}
		}};
		//return this;
		return config

	});

}

AsyncApiLoad.prototype.getMessage = function(messageId) {

	var query = '$.components.messages[?(@.messageId == \'' + messageId + '\')]';
	// console.log(query);
	var message = JSONPath({path: query, json: this.apiContract});

	if (message.length == 1) {
		return message[0];
	} else {
		throw Error('MessageId: ' + messageId + ' not found!');
	}

};

AsyncApiLoad.prototype.getPayload = function(messageId) {
	try {
		var payload = this.getMessage(messageId).payload;
		return payload;
	} catch(e) {
		console.log(e.message);
		return;
	}

};

/**
 * $.channels[*][*].message[*][?(@.messageId == 'pmm-adapter-inbound')]   
 */
AsyncApiLoad.prototype.getTopic = function() {

}

AsyncApiLoad.prototype.getHeaders = function(messageId) {
	try {
		var headers = this.getMessage(messageId).headers;
		return headers;
	} catch(e) {
		console.log(e.message);
		return;
	}

};

AsyncApiLoad.prototype.toJsonSchema = function(schema) {
	return toJsonSchema(schema);
};

/**
module.exports = AsyncApiLoad;
 */

/**
 * Prompt
 * 
 * $ node async/AsyncApiLoad.js \
--serviceName=vndm-publisher \
--messageId=vendorCreated-v1.0 \
--asyncApiUri=/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/vendor-management/app/ms/mrch.vndm.api.vendor-management/docs/vendor-management-async.yaml
*/

let apiUri = process.argv.filter(x => x.indexOf('--asyncApiUri') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let messageId = process.argv.filter(x => x.indexOf('--messageId') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let serviceName = process.argv.filter(x => x.indexOf('--serviceName') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];


var newAsyncApiLoad = new AsyncApiLoad(serviceName.value, apiUri.value);
newAsyncApiLoad.resolve(messageId.value).then(asynApiConfig => {

	console.log('------');
	console.log(asynApiConfig);
	//var headersSchema = asynApiLoad.getHeaders(messageId.value);
	//var payloadSchema = asynApiLoad.getPayload(messageId.value);
	// return;
	var headersJS = {};
	var payloadJS = {};

	headersJS = newAsyncApiLoad.toJsonSchema(asynApiConfig[messageId.value].request.headers);
	//console.log(JSON.stringify(payloadSchema));
	payloadJS = newAsyncApiLoad.toJsonSchema(asynApiConfig[messageId.value].request.payload);

	var config = {[serviceName.value]:{[messageId.value]:{
		request: {
			headers: headersJS,
			payload: payloadJS
		}
	}}};

	console.log('AsyncApiLoad: ' + JSON.stringify(config));

	fs.writeFileSync(newAsyncApiLoad.tmpUri.concat('msx-').concat(serviceName.value).concat('-asyncapi-cfg.json'), JSON.stringify(config, null, 4));

});

/**/
