const { randomUUID } = require('crypto');
const fs = require('fs');

function XReadDummy(userContext, events, done) {

    let dummyUri = '/Users/ext_calexsaezv/Documents/workspace/poc/scriptx/tmp/msx-tst-odbms-adapter-inbound-dummy.json';
    let dummyList = readDummyFile(dummyUri);
    let isDummyOK = false;

    while(!isDummyOK) {
        dummy = dummyList[Math.floor(Math.random() * dummyList.length)];
        dummy.request.data.purchaseOrderInfo.statusId = 1;
        dummy.request.data.purchaseOrderInfo.originCode = 'N';
        dummy.request.data.purchaseOrderInfo.typeId = 8;

        if (dummy.valid) {

            userContext.vars.requestBody = {
                message: {
                    messageId: dummy.caseId,
                    attributes: dummy.headers.data,
                    data: Buffer.from(JSON.stringify(dummy.request.data))
                }
            }
            return done();
        }
        isDummyOK = dummy.valid;
    }

};

function readDummyFile(dummyUri) {
    let dummy = fs.readFileSync(dummyUri, 'utf8');
    let dummyList = JSON.parse(dummy);
    return dummyList;
};

module.exports.XReadDummy = XReadDummy;