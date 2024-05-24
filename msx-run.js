const prompts = require('prompts');
const { exec } = require("child_process");
const { error } = require('console');
const { stdout, stderr } = require('process');

(async () => {
  const response = await prompts([{
    type: 'select',
    name: 'apiType',
    message: 'Api type',
    choices: [{
        title: 'OpenApi 3.0',
        description: 'Open api contract',
        value: 'openapi'
    }, {
        title: 'AsyncApi 2.0',
        description: 'Asyncronous api contract',
        value: 'asyncapi' 
    }],
    initial: 0
  }, {
    type: 'text',
    name: 'applicationName',
    message: 'Application Name',
    validate: applicationName => applicationName.length <= 0 ? "Must indicate a name": true
  }, {
    type: 'text',
    name: 'operationId',
    message: 'Operation name ([all] for all operations)',
    validate: operationId => operationId.length <= 0 ? "Must indicate a value": true
  }, {
    type: 'text',
    name: 'uri',
    message: 'Path to contract',
    validate: operationId => operationId.length <= 0 ? "Must indicate a value": true
  }]);

  console.log(response);

  if (response.apiType === 'openapi') {
    exec(`node sync/OpenApiLoad.js --syncApiUri=${response.uri} --operationId=${response.operationId} --serviceName=${response.applicationName}`, (error, stdout,   stderr) => {
        console.log(error);
        console.log('---');
        console.log(stdout);
        console.log('---');
        console.log(stderr);

    });
  } else if (response.apiType === 'asyncapi') {

    //response.applicationName = 'prch-booking';
    //response.operationId = 'booking';
    //response.uri = '/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/mrch.prch.backend.ms.cloud.purchase-order/docs/purchase-order-asyncapi.yaml';

    exec(`node async/AsyncApiLoad.js --serviceName=${response.applicationName} --messageId=${response.operationId} --asyncApiUri=${response.uri}`, (error, stdout, stderr) => {
        console.log(error);
        console.log('---');
        console.log(stdout);
        console.log('---');
        console.log(stderr);
    });
  } else {
    console.log('Not implement!!')
  }

})();
