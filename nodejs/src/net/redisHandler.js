//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js')
const netUtil = require('./../net/netUtil.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//
const cmdRedis = define.CMD_REDIS;

//
module.exports.subNnaCtrlNotiCB = async (socket, ch, respMsg) => {
    logger.debug(" [REDIS - SUB] [" + ch + "] " + respMsg);
    let splitMsg = respMsg.split(' ');

    if (splitMsg.length === 2)
    {
        let msgKind = splitMsg[cmdRedis.cmd_idx.kind];
        let msgStatus = splitMsg[cmdRedis.cmd_idx.status];
    
        // NN Start
        if (msgStatus.toLowerCase() === cmdRedis.status_cmd.rsp_start)
        {
            let start_res = {
                ip: util.getMyCtrlIP().toString(),
                kind: msgKind, // NN
                status: msgStatus.toLowerCase()
            }
            netUtil.writeData(socket, JSON.stringify(start_res));
        }
        else
        {
            logger.error("invalid redis form at length " + splitMsg.length);
        }
    }
    else if (splitMsg.length === 3)
    {
        let msgKind = splitMsg[cmdRedis.cmd_idx.kind];
        let msgDetailKind = splitMsg[cmdRedis.cmd_idx.detail_kind];
        let msgDetailStatus = splitMsg[cmdRedis.cmd_idx.detail_kind_status];

        // rr update, next, start, stop, leave all .. complete
        if (msgDetailStatus.toLowerCase() === cmdRedis.status_cmd.rsp_complete)
        {
            let suc_res = {
                ip: util.getMyCtrlIP().toString(),
                kind: msgKind + ' ' + msgDetailKind,
                status: msgDetailStatus.toLowerCase()
            }
            netUtil.writeData(socket, JSON.stringify(suc_res));
        }
        else
        {
            logger.error("invalid redis form at length " + splitMsg.length);
        }
    }
    else

    {
        logger.error("invalid redis form");
    }
}

//
module.exports.subScaCmdNotiCB = async (socket, ch, respMsg) => {
    logger.debug(" [REDIS - SUB] [" + ch + "] " + respMsg);
    let splitMsg = respMsg.split(' ');

    if (splitMsg.length === 2)
    {
        let msgKind = splitMsg[cmdRedis.cmd_idx.kind];
        let msgStatus = splitMsg[cmdRedis.cmd_idx.status];
    
        // NN Start
        if (msgStatus.toLowerCase() === cmdRedis.status_cmd.rsp_start)
        {
            netUtil.sendNetRspCmd(socket, util.getMyCtrlIP().toString(), msgKind, msgStatus.toLowerCase());
            // let start_res = {
            //     ip: util.getMyCtrlIP().toString(),
            //     role: msgKind,
            //     status: msgStatus.toLowerCase()
            // }
            // netUtil.writeData(socket, JSON.stringify(start_res));
        }
        else
        {
            logger.error("invalid redis form at length " + splitMsg.length);
        }
    }
    else if (splitMsg.length >= 3)
    {
        let msgKind = splitMsg[cmdRedis.cmd_idx.kind];
        let msgDetailKind = splitMsg[cmdRedis.cmd_idx.detail_kind];
        let msgDetailStatus = splitMsg[cmdRedis.cmd_idx.detail_kind_status];

        // rr update, next, start, stop, leave all .. complete
        if (msgDetailStatus.toLowerCase() === cmdRedis.status_cmd.rsp_complete)
        {
            if (splitMsg.length === 3) // without Data
            {
                netUtil.sendNetRspCmd(socket, util.getMyCtrlIP().toString(), msgKind + ' ' + msgDetailKind, msgDetailStatus.toLowerCase());
            }
            else // with Data
            {
                if (msgKind === cmdRedis.rsp_repl)
                {
                    if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.get)
                    {
                        netUtil.sendNetRspCmd(socket, util.getMyCtrlIP().toString(), msgKind + ' ' + msgDetailKind, msgDetailStatus.toLowerCase(), splitMsg[3] + ' ' + splitMsg[4]);
                    }
                }
                
            }

            // let contract_res = {
            //     ip: util.getMyDataIP().toString(),
            //     kind: msgKind + ' ' + msgDetailKind,
            //     status: msgDetailStatus.toLowerCase()
            // }

            //
            if (msgKind === cmdRedis.rsp_repl)
            {
                if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.get)
                {
                    logger.debug(cmdRedis.rsp_repl_cmd.get);
                    // contract_res.data = splitMsg[3] + ' ' + splitMsg[4];
                }
                else if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.set)
                {
                    logger.debug(cmdRedis.rsp_repl_cmd.set);
                }
                else if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.reset)
                {
                    logger.debug(cmdRedis.rsp_repl_cmd.reset);
                }
                else if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.start)
                {
                    logger.debug(cmdRedis.rsp_repl_cmd.start);
                }
                else if (splitMsg[cmdRedis.cmd_idx.detail_kind] === cmdRedis.rsp_repl_cmd.stop)
                {
                    logger.debug(cmdRedis.rsp_repl_cmd.stop);
                }
            }

            // netUtil.writeData(socket, JSON.stringify(contract_res));
        }
    }
    else
    {
        logger.error("invalid redis form");
    }
}