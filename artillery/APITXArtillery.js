const fs = require('fs');
const YAML = require('yaml')

function APITXArtillery(msxCfg) {
    this.msxCfg = msxCfg;
};

APITXArtillery.prototype.createCfg = function(serviceName, operationId, token, processor, processorFn) {

    var artilleryCfg = {};
    artilleryCfg['config'] = {
        target: this.msxCfg[serviceName].uri,
        processor: processor,
        phases: [{
            duration: 10,
            arrivalRate: 5,
            name: serviceName
        }],
        defaults: {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token.toString()
            }
        }
    };

    artilleryCfg['scenarios'] = [{
        name: serviceName.concat('/', operationId),
        beforeScenario: processorFn,
        flow: [{
            post: {
                url: this.msxCfg[serviceName][operationId].path,
                json: '{{requestBody}}'
            }
        }]
    }];

    var yaml = new YAML.Document();
    yaml.contents = artilleryCfg;

    fs.writeFileSync('artillery/'.concat('msx-artry-'.concat(serviceName).concat('-cfg.yml')), yaml.toString());

};


/**
 * Prompt
 * 
node artillery/APITXArtillery.js \
--serviceName=srx-adapter-inbound \
--operationId=srx-adapter-inbound \
--processor=XReadDummy.js \
--processorFn=XReadDummy \
--msxCfgUri=/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/mrch.prch.backend.ms.cloud.srx-adapter/build/resources/msx-srx-adapter-cfg.json \
--token="Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFjZGEzNjBmYjM2Y2QxNWZmODNhZjgzZTE3M2Y0N2ZmYzM2ZDExMWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NTk0MDU1OS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjMyNTU1OTQwNTU5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxMDc5NTk1ODAwMjQwMjAyMTEyIiwiaGQiOiJmYWxhYmVsbGEuY2wiLCJlbWFpbCI6ImNhc2FlenZpbEBmYWxhYmVsbGEuY2wiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImJ1WU5mR2l3YkVBXzlOdGFGTkplTnciLCJpYXQiOjE2ODExNTU1MzksImV4cCI6MTY4MTE1OTEzOX0.bnJJ0qTZ6h-v6iMhc5V4GYx625ENo3UI8ZOilNbI_Haq_3mFAYVwpDWdct3hwLijhuzFvEqINr4kUlDEmyPrLG-_App1mzMz7myE1p81NnoRMQK7KLAqngkhBTsIEDNaCFr9j01zJ16Fa4kQO8YjXyQoHjbrz4yEZCDinRcv1rIAclWHgTsQyjito0oIXpb8o9XcJVCecYRTjwJiEheOXcSu6D1HzQvYzfrJPPY-lzINlduyM7KHQUCZkeDYGg680x4ruAZZ5zDGmH_ec8eZdql6ec8nQSgECi_JaYg8wBZLHzun9wByoJqEq964rSGWBLDVsXaXI8uymdiwZpV4kQ"
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

let token = process.argv.filter(x => x.indexOf('--token') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let processor = process.argv.filter(x => x.indexOf('--processor') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

let processorFn = process.argv.filter(x => x.indexOf('--processorFn') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0].value;

/**
 * Init
 */
var msxCfg = JSON.parse(fs.readFileSync(msxCfgUri, 'utf8'));

var apiTXArtillery = new APITXArtillery(msxCfg);
apiTXArtillery.createCfg(serviceName, operationId, token, processor, processorFn);