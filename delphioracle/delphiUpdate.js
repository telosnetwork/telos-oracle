const eosjs = require('eosjs')
const fetch = require('node-fetch')
const util = require('util')
const delphiConfig = require('./delphiConfig')
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig').JsSignatureProvider
const axios = require('axios')
const JsonRpc = eosjs.JsonRpc
const Api = eosjs.Api

const nodeUrl = delphiConfig.nodeUrl
const pk = delphiConfig.privateKey
const contractAccount = delphiConfig.contractAccount
const contractAction = delphiConfig.contractAction
const oracleName = delphiConfig.oracleName
const oraclePermission = delphiConfig.oraclePermission

const signatureProvider = new JsSignatureProvider([pk]);
const rpc = new JsonRpc(nodeUrl, { fetch })

const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new util.TextDecoder(),
    textEncoder: new util.TextEncoder()
});

const telosCoingecko = 'https://api.coingecko.com/api/v3/simple/price?ids=telos&vs_currencies=EOS,USD'

doQuotes()

async function getTLOSUSD() {
    const coingeckoReply = await axios.get(telosCoingecko)
    const tlosusd = coingeckoReply.data.telos.usd;
    return tlosusd
}

async function doQuotes() {
    const tlosusd = await getTLOSUSD()
    const quotes = [{ "value": parseInt(Math.round(tlosusd * 10000)), pair: "tlosusd" }];
    await sendActions([{
        account: contractAccount,
        name: contractAction,
        authorization: [{
            actor: oracleName,
            permission: oraclePermission,
        }],
        data: {
            owner: oracleName,
            quotes: quotes
        }
    }])
}

async function sendActions(actions) {
    try {
        const result = await api.transact({ actions: actions }, { blocksBehind: 3, expireSeconds: 30 });
    } catch (e) {
        console.log(e);
    }
}