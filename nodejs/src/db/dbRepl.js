//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const logger = require('./../utils/winlog.js');
const debug = require("./../utils/debug.js");

module.exports.stopReplSlaves = async () => {
    let queryV = `STOP ALL SLAVES`;
    // logger.debug("STOP ALL SLAVES queries : " + queryV);
    await dbUtil.query(queryV);
}

module.exports.resetReplSlaves = async () => {
    await this.stopReplSlaves();

    const conn = await dbUtil.getConn();

    [query_result] = await conn.query(`SHOW ALL SLAVES STATUS`);
    logger.debug("dropReplSlaves length : " + query_result.length);
    for(var i = 0; i < query_result.length; i++)
    {
        // for ( var keyNm in query_result[i]) {
        //     logger.debug("key : " + keyNm + ", value : " + query_result[i][keyNm]);
        // }

        let queryV = `RESET SLAVE '${query_result[i]['Connection_name']}' ALL`;
        // logger.debug("RESET SLAVE queries : " + queryV);
        await conn.query(queryV);
    }
    
    await dbUtil.releaseConn(conn);
}
