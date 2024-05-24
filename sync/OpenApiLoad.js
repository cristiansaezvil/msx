/* 
 * OpenApi Load
 */
const fs = require('fs');
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const convert = require('@openapi-contrib/json-schema-to-openapi-schema');
var toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');
const {JSONPath} = require('jsonpath-plus');

/**
 * Constructor
 */
function OpenApiLoad() {
    this.tmpUri = 'tmp/';
    this.apiContract = null;
}

OpenApiLoad.prototype.resolve = function(syncUri) {

    return $RefParser.dereference(syncUri).then(syncApi => {

        this.apiContract = syncApi;
        return this;

    });
}

OpenApiLoad.prototype.tmpJsonSchemaToOpenApi = function(schema) {

    this.toOpenApiSchema(schema).then(openapiSchema => {
        fs.writeFileSync(this.tmpUri + 'openapi-schema.json', openapiSchema);
    });
    
};

OpenApiLoad.prototype.getPath = function(operationId, syncApi) {
    var qry = '$.paths.*.[?(@.operationId == \'' + operationId + '\')]';
    var rs = JSONPath({json: syncApi, path: qry, resultType: 'path'});

    console.debug('OpenApiLoad.getPath.rs: '.concat(JSON.stringify(rs)));

    if (rs.length == 1) {

        var matches = rs[0].match(/\[([^\]]+)\]/g);
        var pathArray = matches.map(match => match.slice(1, -1).replaceAll('\'', ''));

        console.debug('OpenApiLoad.getPath.pathArray: '.concat(JSON.stringify(pathArray)));

        return pathArray[1];

    } else {
        console.error('OpenApiLoad.getPath: Path not found!');
        throw new Error('Path not found!');
    }

    return rs;
};

OpenApiLoad.prototype.getPathParam = function(operationId) {

    var query = '$.paths.*.[?(@.operationId == \'' + operationId + '\')].parameters.[?(@.in == \'path\')]';
    var params = JSONPath({path: query, json:this.apiContract});

};

/**
 * 
 */

OpenApiLoad.prototype.getResponse20_Schema = function(syncApi, operationId) {

    var query = '$.paths.*.[?(@.operationId == \'' + operationId + '\')].responses[?(@path.includes(\'[20\'))].content.*.schema';
    console.debug('OpenApiLoad.getResponse20_Schem.query: '.concat(query));
    var responseSchema = JSONPath({path:query, json:syncApi});

    if (responseSchema.length > 1) {
        console.log('OpenApiLoad.getResponse20_Schema: Two or more responses finder. Default is 0.');
    } else if(responseSchema.length == 0) {
        console.log('OpenApiLoad.getResponse20_Schema: Schema not found.');
    }

    //var schema = response[0].content['application/json'].schema;
    return responseSchema[0];

};

OpenApiLoad.prototype.getRequestBody_Schema = function(syncApi, operationId) {

    console.debug('OpenApiLoad.getRequestBody_Schema.operationId: '.concat(operationId));
    var query = '$.paths.*.[?(@.operationId == \'' + operationId + '\')].requestBody.content.*.schema';
    console.debug('OpenApiLoad.getRequestBody_Schema.query: '.concat(query));
    var requestSchema = JSONPath({path: query, json: syncApi});

    if (requestSchema.length === 0) {
        console.log('OperationId: '.concat(operationId.concat(' request not found.')));
        return;
    } else {
        console.debug('OpenApiLoad.getRequestBody_Schema.requestSchema: '.concat(requestSchema[0]));
        return requestSchema[0];
    }

    /**
    if (requestSchema.length ==! 1) {
        console.log('OpenApiLoad.getRequestBody_Schema: Request is wrong')
    }
     */

};

OpenApiLoad.prototype.getMethod = function(syncApi, operationId) {
    let query = '$.paths.*.[?(@.operationId == \'' + operationId + '\')]';
    let result = JSONPath({path: query, json: syncApi, resultType: 'parentProperty'});

    console.debug('OpenApiLoad.getMethod.result: '.concat(JSON.stringify(result)));
    return result[0];

};

OpenApiLoad.prototype.allOperationId = function() {

    var query = '$.paths.*.*.operationId';
    var operationIds = JSONPath({path: query, json: this.apiContract});
    console.debug('OpenApiLoad.allOperationId: '.concat(JSON.stringify(operationIds)));
    return operationIds;

};

OpenApiLoad.prototype.serviceName = function() {
    let servName = JSONPath({path: '$.info.x-service-name', json: this.apiContract});

    if (servName.length == 1) {
        return servName[0];
    } else {
        console.log('OpenApiLoad.serviceName: Not found');
        return 'default-service-name';
    }
};

OpenApiLoad.prototype.toJsonSchema = function(openApiSchema) {

    return toJsonSchema(openApiSchema);

};

OpenApiLoad.prototype.toOpenApiSchema = function(jsonSchema) {

    return convert.default(jsonSchema);

};


/**
 * Excecution
 */

/**
 * Prompt
 * 

node sync/OpenApiLoad.js --syncApiUri=/Users/ext_calexsaezv/Documents/workspace/falabella/merchandise/purchase-order/app/ms/accounts-playable/mrch.prch.backend.ms.cloud.cpp-finanzas-adapter/src/resources/prch-cpp-finanzas-adapter-openapi.yaml \
--operationId=findByPoAccountsPayable \
--serviceName=cpp-finanzas-adapter

 */

var newOpenApiLoad = new OpenApiLoad();

let apiUri = process.argv.filter(x => x.indexOf('--syncApiUri') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let operationId = process.argv.filter(x => x.indexOf('--operationId') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

let serviceName = process.argv.filter(x => x.indexOf('--serviceName') == 0).map(arg => {
    return {arg: arg.replaceAll('--', '').split('=')[0], value: arg.split('=')[1]};
})[0];

/**
 * Read
 */
newOpenApiLoad.resolve(apiUri.value).then(openApiLoad => {

    let opIds = new Array();
    if (operationId.value == 'all') {

        ops = openApiLoad.allOperationId().map(op => {

            requestSchema = openApiLoad.getRequestBody_Schema(openApiLoad.apiContract, op);
            responseSchema = openApiLoad.getResponse20_Schema(openApiLoad.apiContract, op);
            const method = openApiLoad.getMethod(openApiLoad.apiContract, op);
            const opPath = openApiLoad.getPath(op, openApiLoad.apiContract);
            
            let requestJS;
            let responseJS;

            if (requestSchema) {
                requestJS = openApiLoad.toJsonSchema(requestSchema);
            }
            if (responseSchema) {
                responseJS = openApiLoad.toJsonSchema(responseSchema);
            }

            return {[op]: {
                method: method,
                path: opPath,
                request: {
                    payload: requestJS
                },
                responses:{
                    200: {
                        payload: responseJS
                    }
                }
            }};

        });

    } else {

        /**
         * Bug for operationId
         */

        requestSchema = openApiLoad.getRequestBody_Schema(operationId.value);
        responseSchema = openApiLoad.getResponse20_Schema(openApiLoad.apiContract, operationId.value);

        let requestJS;
        let responseJS;

        if (requestSchema) {
            requestJS = openApiLoad.toJsonSchema(requestSchema);
        }
        if (responseSchema) {
            responseJS = openApiLoad.toJsonSchema(responseSchema);
        }

        ops = {[operationId.value]: {
            request: {
                payload: requestJS
            },
            responses:{
                200: {
                    payload: responseJS
                }
            }
        }};

    }


    let serviceName = openApiLoad.serviceName();
    let serviceCfg = {}; // = {[serviceName]: ops};

    console.debug('OpenApiLoad.resolve.ops: '.concat(JSON.stringify(ops)));

    for(let x of ops) {
        console.debug('x: '.concat(x));
        // serviceCfg[serviceName][Object.keys(x)[0]] = x;
        serviceCfg[serviceName] = x;
        console.log(serviceCfg);
    }
    

    fs.writeFileSync(openApiLoad.tmpUri.concat('msx-').concat(serviceName).concat('-openapi-cfg.json'), JSON.stringify(serviceCfg, null, 4));

    

})


