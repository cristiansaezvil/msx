const fs = require('fs');
var generate = require('./generator/index.js');

function JsonDummy() {

}

JsonDummy.prototype.fromJsonSchema = function(jsonSchema) {

	var dummy = generate(jsonSchema);

	var dummyInfo = {
		records: dummy.length
	};

	console.log(JSON.stringify(dummyInfo));

	/**
	dummy.forEach(x => {
		console.log(JSON.stringify(x));
	});
	*/
	return dummy;
	//fs.writeFileSync('tmp/odbms-adapter-inbound-dummy.js', JSON.stringify(dummy));

}


/**
var path = '/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/legacy/mrch.prch.backend.ms.cloud.odbms-adapter/src/resources/msx-odbms-adapter-inbound-cfg.json';
var jsonSchema = fs.readFileSync(path, {encoding:'utf8', flag:'r'}, (err, data) => {
	if (err) {
		console.log('ERROR: ' + err);
	}
});

var newJsonDummy = new JsonDummy();
newJsonDummy.jsonSchema(JSON.parse(jsonSchema)['odbms-adapter-inbound']['odbms-adapter-inbound']['request']['payload']);
 */

module.exports = JsonDummy;