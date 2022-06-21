//
const config = require('./config/config.js');
const sock = require('./src/net/socket.js');
const redisUtil = require('./src/net/redisUtil.js');
const cryptoUtil = require('./src/sec/cryptoUtil.js');
const dbMain = require('./src/db/dbMain.js');
const cli = require('./src/cli/cli.js');

const logger = require('./src/utils/winlog.js');

//
const main = async() => {
    //
    logger.info("config.MARIA_CONFIG : " + JSON.stringify(config.MARIA_CONFIG));
    //
    cryptoUtil.setMyKey(config.myKeyPathConfig);

    await dbMain.initDatabase();

    let isa = await sock.isClient();
    redisUtil.setRedis(isa);

    await cli.cliCallback();
}

main();

