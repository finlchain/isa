//
const fs = require('fs');

//
const cryptoSsl = require("./../../../../addon/crypto-ssl");

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const redisUtil = require('./../net/redisUtil.js');
const dbUtil = require('./../db/dbUtil.js');
const logger = require('./../utils/winlog.js');

//
module.exports.handler = async (cmd) => {
    let retVal = true;

    logger.debug('ISA CLI Received Data : ' + cmd);

    let cmdSplit = cmd.split(' ');

    if(cmdSplit[0] === 'key') 
    {
        let orgFilePath = cmdSplit[2];
        let orgFile = fs.readFileSync(orgFilePath);

        if (cmdSplit[1] === 'enc')
        {
            if (orgFilePath.includes('pem'))
            {
                //
                let dstFilePath = util.stringReplace(orgFilePath, 'pem', 'fin');

                //
                let keySeed = config.INFO_PATH.KEY_SEED;

                logger.debug("[CLI] orgFilePath : " + orgFilePath + ", dstFilePath : " + dstFilePath + ", keySeed : " + keySeed);

                //
                let result = cryptoSsl.aesEncFile(orgFilePath, dstFilePath, keySeed, keySeed.length);
            
                if (result = true)
                {
                    logger.info("[CLI] " + "SUCCSS");
                }
                else
                {
                    logger.error("[CLI] " + "ERROR 1");
                }
            }
            else
            {
                logger.error("[CLI] " + "ERROR 2");
            }
        }
        else // dec
        {
            //
            if (orgFilePath.includes('fin'))
            {
                //
                let keySeed = config.INFO_PATH.KEY_SEED;

                logger.debug("[CLI] orgFilePath : " + orgFilePath + ", keySeed : " + keySeed);

                let decFile = cryptoSsl.aesDecFile(orgFilePath, keySeed, keySeed.length);
                logger.info(decFile);
            }
            else
            {
                logger.error("[CLI] " + "ERROR 3");
            }
        }
    }
    else if(cmd.slice(0,9) === "act query"){
        await dbUtil.actQuery(cmd.slice(10));
    }
    else if  (cmd.slice(0,3) === "ips")
    {
        let localIPs = util.getMyIPs();
        //
        await util.asyncForEach(localIPs, async(element, index) => {
            logger.debug("ip[" + index + "] : " + element);
        });
    }
    else if (cmd.slice(0,13) === "contract test")
    {
        let txCnt = 1;
        let myContractTest = define.CMD_CTRL_NOTI.req_contract_test + ' ';

        logger.debug("cmdSplit[2] : " + cmdSplit[2]);
        if (!isNaN(Number(cmdSplit[2])))
        {
            txCnt = Number(cmdSplit[2]);
        }

        myContractTest += txCnt.toString();

        await redisUtil.write(define.CMD_CTRL_NOTI.redis_cmd_noti, myContractTest);
    }
    else if (cmd.slice(0,12) === "contract chk")
    {
        let sigChkMode = cmdSplit[2];

        let data = define.CMD_CTRL_NOTI.req_contract_chk + ' ' + sigChkMode;
        await redisUtil.write(define.CMD_CTRL_NOTI.redis_cmd_noti, data);
    }
    else
    {
        retVal = false;
        logger.error("[CLI] " + cmd + ' is an incorrect command. See is --help');
    }

    return retVal;
}
