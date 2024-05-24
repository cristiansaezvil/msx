const fs = require('fs');
var generate = require('./generator/index.js');
const { v4: uuidv4 } = require('uuid');
const { randomUUID } = require('crypto');

function APITXTest(msxCfg) {
	this.msxCfg = msxCfg;
}

APITXTest.prototype.test = function(serviceName, operationId) {

	var requestDummy = this.createDummy(this.msxCfg[serviceName][operationId].request.payload);
	var headersDummy = this.createDummy(this.msxCfg[serviceName][operationId].request.headers);

	console.log('Dummy headers cases: '.concat(headersDummy.length));
	console.log('Dummy request cases: '.concat(requestDummy.length));

	var dummy = this.createRequest(headersDummy, requestDummy);

	return dummy;

};

APITXTest.prototype.createDummy = function(schema) {

	var dummy = [];

	if (schema) {
		try {
			dummy = generate(schema);
			//console.log(dummy);
		} catch(e) {
			console.log('APITXTest.createDummy: ERROR: ' + e);
			throw e;
		}
	} else {
		console.log('APITXTest.createDummy: There is no schema to create data!');
	}

	return dummy;

};

APITXTest.prototype.createRequest = function(headers, requests) {

	var x = 0;
	var requestsDummy = requests.map(tst => {

		if (!headers[x]) {
			x = 0;
		}

		let header = JSON.parse(JSON.stringify(headers[x]));
		header.data.timestamp = Date.now();
		header.data.eventId = randomUUID();

		var reqTmp = {};
		reqTmp = {
			caseId: header.data.eventId,
			headers: {
				message: header.message,
				data: header.data,
				valid: header.valid
			},
			request: {
				message: tst.message,
				data: tst.data,
				valid: tst.valid,
				property: tst.property
			},
			valid: (header.valid && tst.valid)
		};

		x = x+1;

		return reqTmp;

	});

	return requestsDummy;

};

//module.exports = APITXTest;

/** */

let msxCfgUri = process.argv.filter(x => x.indexOf('--msxCfgUri') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let serviceName = process.argv.filter(x => x.indexOf('--serviceName') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let operationId = process.argv.filter(x => x.indexOf('--operationId') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let test = process.argv.filter(x => x.indexOf('--test') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let output = process.argv.filter(x => x.indexOf('--output') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

var msxCfg = fs.readFileSync(msxCfgUri.value, 'utf8');

var newAPITXTest = new APITXTest(JSON.parse(msxCfg));
var dataDummy = newAPITXTest.test(serviceName.value, operationId.value);

//console.log(dataDummy);
//console.log(output.value);

fs.writeFileSync('tmp/msx-tst-'.concat(serviceName.value).concat('-dummy.json'), JSON.stringify(dataDummy, null, 4));

/**
 * Prompt
 * 
 * $ node test/APITXTest.js \
--msxCfgUri=/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/legacy/mrch.prch.backend.ms.cloud.odbms-adapter/src/resources/msx-odbms-adapter-inbound-cfg.json \
--serviceName=odbms-adapter-inbound \
--operationId=odbms-adapter-inbound \
--test=30 \
--output=deprecated
 * 
 */
