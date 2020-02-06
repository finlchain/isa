const pemread = require('crypto-key-composer');
const fs = require('fs');
const crypto = require('crypto');

const config = require('../../config/config.js');
const define = require('../../config/define.js');

module.exports.PEM_pubkey_read = async (path) => {
    let pemRead = pemread.decomposePublicKey(fs.readFileSync(path));
    let publicKey = await toBuffer(pemRead.keyData.bytes).toString('hex');
    return publicKey;
}

module.exports.GenerateHash = (MessageBuffer) => {
    const sha256Result = crypto.createHash(define.cryptoArg.hashKind);
    sha256Result.update(MessageBuffer);
    return sha256Result.digest(define.cryptoArg.hex);
}

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}