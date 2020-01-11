const ecc = require('eosjs-ecc');

class NumberSigner {

    constructor(pk) {
        this._pk = pk
    }

    signNumber(n) {
        const digest = this.getDigest(n)
        console.log(`${n} => ${digest}`)
        return ecc.signHash(digest, this._pk)
    }

    getDigest(n) {
        const buf = Buffer.alloc(8)
        buf.writeUIntLE(n, 0, 6);
        return ecc.sha256(buf, 'hex')
    }

}

module.exports = NumberSigner
