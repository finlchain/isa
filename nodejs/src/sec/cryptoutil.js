//
const pemreader = require('crypto-key-composer');
const fs = require('fs');
const crypto = require('crypto');

//
const cryptoSsl = require("./../../../../addon/crypto-ssl");

//
const config = require('../../config/config.js');
const define = require('../../config/define.js');
const util = require('../utils/commonUtil.js');
const logger = require('../utils/winlog.js');

//
let myKey = new Object();

//////////////////////////////////////////////////
//
module.exports.decKey = (keyPath, keySeed) => {
    let dec;

    if (keyPath.includes("fin"))
    {
        logger.debug("It is an encrypted file");

        dec = cryptoSsl.aesDecFile(keyPath, keySeed, keySeed.length);
    }
    else
    {
        logger.debug("It is an decrypted file");

        dec = fs.readFileSync(keyPath);
    }

    return dec;
}

module.exports.readPubkeyPem = (path, seed) => {
    let decPubKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePublicKey(decPubKey);
    return pemRead;
}

module.exports.readPrikeyPem = (path, seed) => {
    let decPriKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePrivateKey(decPriKey);
    return pemRead;
}

module.exports.getPubkey = (pubkeyPath) => {
    //
    let pubkey_path = typeof pubkeyPath !== 'undefined' ? pubkeyPath : config.myKeyPathConfig.pubkey;

    //
    let pemRead = this.readPubkeyPem(pubkey_path, config.INFO_PATH.KEY_SEED);

    //
    // let publicKey = util.bytesToBuffer(pemRead.keyData.bytes).toString('hex');

    // return publicKey;

    if(pubkey_path.includes("ed")) 
    {
        let pubkey;

        pubkey = util.bytesToBuffer(pemRead.keyData.bytes);

        return (define.CONTRACT_DEFINE.ED_PUB_IDX + pubkey.toString('hex'));
    }
    else
    {
        let ec_point_x;
        let ec_point_y;

        ec_point_x = util.bytesToBuffer(pemRead.keyData.x).toString('hex');
        ec_point_y = util.bytesToBuffer(pemRead.keyData.y).toString('hex');
        
        const uncompressedpubkey = define.SEC_DEFINE.KEY_DELIMITER.SECP256_UNCOMPRESSED_DELIMITER + ec_point_x + ec_point_y;
        const pubkey = ECDH.convertKey(uncompressedpubkey,
                                                define.SEC_DEFINE.CURVE_NAMES.ECDH_SECP256R1_CURVE_NAME,
                                                "hex",
                                                "hex",
                                                define.SEC_DEFINE.CONVERT_KEY.COMPRESSED);

        return pubkey;
    }
}

/////////////////////////////////////////////////////
// My Key
module.exports.setMyKey = (myKeyPath) => {
    // for net
    myKey.prikey = this.readPrikeyPem(myKeyPath.prikey, config.INFO_PATH.KEY_SEED);
    myKey.pubkey = this.readPubkeyPem(myKeyPath.pubkey, config.INFO_PATH.KEY_SEED);
}

module.exports.getMyPubkey = () => {
    let pubkey = this.getPubkey();
    return pubkey;
}

//////////////////////////////////////////////////
// Get sha256 Hash
module.exports.genSha256Str = (MessageBuffer) => {
    const sha256Result = crypto.createHash(define.CRYPTO_ARG.HASH);
    sha256Result.update(MessageBuffer);
    return sha256Result.digest(define.CRYPTO_ARG.HEX);
}
