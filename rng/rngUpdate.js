const eosjs = require('eosjs')
const fetch = require('node-fetch')
const util = require('util')
const JsonRpc = eosjs.JsonRpc
const Api = eosjs.Api
const nodeUrl = 'https://testnet.telos.caleos.io'
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig').JsSignatureProvider
const NumberSigner = require('../libs/classes/NumberSigner')
const rngConfig = require('./rngConfig')

const testerOracleAccount = rngConfig.oracleName
const testerOraclePermission = rngConfig.oraclePermission
const contractAccount = rngConfig.contractAccount
const contractAction = rngConfig.contractAction
const requestsTable = rngConfig.requestsTable
const requestIdProperty = rngConfig.requestIdProperty

const pk = rngConfig.privateKey

const signatureProvider = new JsSignatureProvider([pk]);
const rpc = new JsonRpc(nodeUrl, { fetch })

const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new util.TextDecoder(),
    textEncoder: new util.TextEncoder()
});

(async () => {
    const rows = await rpc.get_table_rows({
        json: true,
        code: contractAccount,
        scope: contractAccount,
        table: requestsTable
    })

    const signer = new NumberSigner(pk)
    if (rows.rows.length < 1) {
        console.log('No requests')
        return false
    }

    const requestId = rows.rows[0][requestIdProperty]

    sendActions([{
        account: contractAccount,
        name: contractAction,
        authorization: [{
            actor: testerOracleAccount,
            permission: testerOraclePermission,
        }],
        data: {
            request_id: requestId,
            sig: signer.signNumber(requestId),
            oracle_name: testerOracleAccount
        }
    }])
})();

async function sendActions(actions) {
    try {
        const result = await api.transact({ actions: actions }, { blocksBehind: 3, expireSeconds: 30 });
    } catch (e) {
        console.log(e);
    }
}
