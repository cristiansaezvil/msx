
//const { JSONSchemaFaker } = require("json-schema-faker");
//var generate = require('./generator/index.js');

//const APITXRestClient = require('./APITXRestClient');
const JsonDummy = require('./JsonDummy')
const { v4: uuidv4 } = require('uuid');
//const APITXAnalyzer = require('./APITXAnalyzer');


function APITXTest(apiTXRestClientCfg) {
	this.apiTXRestClientCfg = apiTXRestClientCfg;
	this.newAPITXRestClient = new APITXRestClient();
}

APITXTest.prototype.apiTXRestClientCfg = null;


APITXTest.prototype.run = function() {
	 
	this.getToken(this.apiTXRestClientCfg, (token) => {
		this.prepareTest({token: token});
	});

}		

APITXTest.prototype.prepareTest = function(authCfg) {
	//this.newAPITXRestClient = new APITXRestClient();

	var paths = Object.keys(this.apiTXRestClientCfg.restCfg);
	for(var path of paths) {
		var methods = Object.keys(this.apiTXRestClientCfg.restCfg[path]);
		for(var method of methods) {
			var dummyRequest = this.request(this.apiTXRestClientCfg.restCfg[path][method].request);
			var dummyParams = this.parameters(this.apiTXRestClientCfg.restCfg[path][method].parameters);

			dummyParams.headers['Authorization'] = authCfg.token;

			for(var test of dummyRequest) {
				dummyParams.data = test.data;
				var restClientCfg = {
					id: this.apiTXRestClientCfg.id,
					testId: uuidv4(),
					operationId: this.apiTXRestClientCfg.restCfg[path][method].operationId,
					endpointUri: this.apiTXRestClientCfg.server.url.concat(path),
					method: this.apiTXRestClientCfg.restCfg[path][method].method,
					args: dummyParams,
					test: {
						valid: test.valid,
						message: test.message,
						property: test.property
					}
				};

				this.newAPITXRestClient.exec(restClientCfg, this.analizer);
			}

		}
	}
}

APITXTest.prototype.getToken = function(apiTXRestClientCfg, callback) {
	/**
	 * Test config
	 */
	var authCfg = {
		url: 'https://api-qa-ftc-sc.falabella.tech/mrch-prch/v1/authorization',
		args: {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: {
				'client_id': 'QkM9D8DCiBLIBaTmpZsemKOyImjiQx7s',
				'client_secret': '3aYuGTL8IGv2btNy',
				'grant_type': 'client_credentials'
			}
		}
	};

	var newAPITXRestClient = new APITXRestClient();
	newAPITXRestClient.auth(authCfg, callback);

}

APITXTest.prototype.analizer = function(testCfg) {
	var newAPITXAnalyzer = new APITXAnalyzer(testCfg);
	newAPITXAnalyzer.logger();
}

APITXTest.prototype.restClientCfg = function(endpointUri, method, ) {

	var cfg = {
		endpointUri: '',
		method: '',
		args: {
			path: {},
			parameters: {},
			headers: {},
			data: {}
		}
	};
}

APITXTest.prototype.parameters = function(parameters) {
	
	/**
	 * Dummy data pending...
	 */ 
	// var dummyParams = generate(parameters[0].schema);
	// console.log(dummyParams);
	

	var params = {
		path: {},
		parameters: {},
		headers: {}
	};

	for(var param of parameters) {
		if(param.in.toLowerCase() == 'header')
			// params.headers[param.name] = param.schema.example;
			params.headers[param.name] = 'CL';
		else if(param.in.toLowerCase() == 'path')
			// params.path[param.name] = param.schema.example;
			params.path[param.name] = 'test';
		else if(param.in.toLowerCase() == 'query')
			// params.parameters[param.name] = param.schema.example;
			params.parameters[param.name] = 'test';
	}

	return params;

}

APITXTest.prototype.request = function(request) {
	var dummy = generate(request);
	//console.log(JSON.stringify(dummy));
	//var dummy = JSONSchemaFaker.generate(request);
	return dummy;
}


module.exports = APITXTest;