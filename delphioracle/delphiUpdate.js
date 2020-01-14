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

const telosCoingecko = 'https://api.coingecko.com/api/v3/simple/price?ids=telos&vs_currencies=EOS,USD,BTC'

doQuotes()

async function getPrices() {
    const coingeckoReply = await axios.get(telosCoingecko)
    const usd = coingeckoReply.data.telos.usd;
    const btc = coingeckoReply.data.telos.btc;
    const eos = coingeckoReply.data.telos.eos;
    return { usd, btc, eos }
}

async function doQuotes() {
    const prices = await getPrices()
    const quotes = [{
        "pair": "tlosusd",
        "value": parseInt(Math.round(prices.usd * 10000))
    }, {
        "pair": "tlosbtc",
        "value": parseInt(Math.round(prices.btc * 100000000))
    }, {
        "pair": "tloseos",
        "value": parseInt(Math.round(prices.eos * 10000))
    }];
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