const fs = require('fs');
var RestClient = require('node-rest-client').Client;

function APITXTestRun(msxCfg) {
    this.msxCfg = msxCfg;
}

APITXTestRun.prototype.run = function (serviceName, operationId, testData, token) {

    var testCliConfig = {
        uri: this.msxCfg[serviceName].uri.concat(this.msxCfg[serviceName][operationId].path),
        method: this.msxCfg[serviceName][operationId].method,
        args: {}
    };

    for (var test of testData) {
        testCliConfig.args.data = {
            message: {
                data: Buffer.from(JSON.stringify(test.request.data)).toString('base64'),
                attributes: test.headers.data
            }
        }

        testCliConfig.args.headers = {Authorization: 'Bearer '.concat(token), 'Content-Type': 'application/json'};

        this.restCli(testCliConfig).then(res => {
            
            
        });

    }
}

APITXTestRun.prototype.restCli = async function (serviceCfg) {

    try {

        var restClient = new RestClient();
        serviceCfg['test'] = {start: Date.now()};
        var res = restClient[serviceCfg.method](serviceCfg.uri, serviceCfg.args, function (data, response) {
            serviceCfg.test.end = Date.now();
            serviceCfg.test.response = {
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                data: data
            };
            
            console.log(JSON.stringify(serviceCfg.test));

            return serviceCfg;
        });

        res.on('error', (err) => {
            console.log('APITXTestRun.restCli: '.concat(err.code));
        });

        return res;

    } catch (e) {
        console.log('Error: '.concat(e.message));
    }
}

/**
 * 
 * Prompt 
 * 
 * ex: node test/APITXTestRun.js \
--serviceName=odbms-adapter-inbound \
--operationId=odbms-adapter-inbound \
--msxCfgUri=/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/legacy/mrch.prch.backend.ms.cloud.odbms-adapter/src/resources/msx-odbms-adapter-inbound-cfg.json \
--testDataUri=/Users/ext_calexsaezv/Documents/workspace/poc/scriptx/tmp/msx-tst-odbms-adapter-inbound-dummy.json \
--token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhYWU4ZDdjOTIwNThiNWVlYTQ1Njg5NWJmODkwODQ1NzFlMzA2ZjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NTk0MDU1OS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjMyNTU1OTQwNTU5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxMDc5NTk1ODAwMjQwMjAyMTEyIiwiaGQiOiJmYWxhYmVsbGEuY2wiLCJlbWFpbCI6ImNhc2FlenZpbEBmYWxhYmVsbGEuY2wiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjBnQUNmUUYxSWxWcTBwMlhpZThIeHciLCJpYXQiOjE2ODA3MDUxNjYsImV4cCI6MTY4MDcwODc2Nn0.HTcaRF0pa4HYinrW9gcBFGMRMSXNHYzZdD9bmkUq2apWNsmcHj8N2borvsY0V9ya-2u9oe6GnV45MmUJ4oRPead13H5PmjViyWVFDWzvr6OuvunjbgRnAkeJafBxWCZ9GhLw721G1dgXgs5Kdx8WoMNHUmhKc8rHlRm8qJmzw2PTlc2NpolrhwH6JyHDAW8ca3mmsFeJuaJ6rVzImZDFAAfKCkTswMkKJVd5cYbBnqqYycYiVVoPO2a7UebQyijVFzJ5cxpP9DiOal0iu9TLgA_NoMdegL8qcQ4MB2JJnyll9iNbQ9yL_77Z-9fApIyeM0hM8KokdpvjmYN_8iP47w
 * 
 */
let msxCfgUri = process.argv.filter(x => x.indexOf('--msxCfgUri') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let serviceName = process.argv.filter(x => x.indexOf('--serviceName') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let operationId = process.argv.filter(x => x.indexOf('--operationId') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let testDataUri = process.argv.filter(x => x.indexOf('--testDataUri') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let token = process.argv.filter(x => x.indexOf('--token') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

var msxCfg = fs.readFileSync(msxCfgUri, 'utf8');
var testData = fs.readFileSync(testDataUri, 'utf8');


var newAPITXTestRun = new APITXTestRun(JSON.parse(msxCfg));
newAPITXTestRun.run(serviceName, operationId, JSON.parse(testData), token);
