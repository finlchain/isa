//
const dbUtil = require('./../db/dbUtil.js');
const dbNN = require('./../db/dbNN.js');

const logger = require('./../utils/winlog.js');
const debug = require("./../utils/debug.js");

//
module.exports.selectMaxBlkNumFromBlkContents = async () => {
    const conn = await dbUtil.getConn();
    // await exeQuery(conn, dbNN.querys.useBlock);

    let lastBN = '0';

    try {
        [query_result] = await dbUtil.exeQuery(conn, dbNN.querys.block.blk_contents.selectLastBlkNum);
        if (query_result.length)
        {
            if (query_result[0].max_blk_num !== null)
            {
                lastBN = query_result[0].max_blk_num;
            }
        }
    
        // for(var i = 0; i < query_result.length; i++)
        // {
        //     for ( var keyNm in query_result[i])
        //     {
        //         logger.debug("query_result[i][keyNm] : [" + i +"] " + keyNm + " - " + query_result[i][keyNm]);
        //         if (query_result[i][keyNm])
        //         {
        //             lastBN = query_result[i][keyNm];
        //         }
        //     }
        // }
    } catch (err) {
        debug.error(err);
        logger.error("selectMaxBlkNumFromBlkContents Func");
    }

    logger.debug("lastBN : " + lastBN);

    await dbUtil.releaseConn(conn);

    return lastBN;
}
