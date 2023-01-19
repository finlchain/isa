//
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;
const os = require('os');
const fork = require('child_process').fork;
const fs = require('fs');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const netUtil = require('./../net/netUtil.js');
const redisUtil = require('./../net/redisUtil.js');
const sock = require('./../net/socket.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require('./../db/dbUtil.js');
const dbFB = require('./../db/dbFB.js');
const dbNN = require('./../db/dbNN.js');
const dbRepl = require("./../db/dbRepl.js");
const dbNNHandler = require('./../db/dbNNHandler.js');
const logger = require('./../utils/winlog.js');
const applog = require('./../utils/applog.js');
//
const cmd = define.CMD_CTRL_NOTI;
const cmdRedis = define.CMD_REDIS;

// Net Conf
module.exports.saveNetConf = async (data) => {
    let rrNet = data.data1;
    let node = data.data3;
    let role = data.data4;

    // Delete old files
    try {
        await fs.unlinkSync(config.CFG_PATH.NET_CFG.NNA_RRNET_JSON, (err) => { });
        logger.debug(config.CFG_PATH.NET_CFG.NNA_RRNET_JSON + ' delete success');
    }
    catch (err) {
        logger.debug(config.CFG_PATH.NET_CFG.NNA_RRNET_JSON + ' no exists');
    }
    
    try {
        await fs.unlinkSync(config.CFG_PATH.NET_CFG.NNA_NODE_JSON, (err) => { });
        logger.debug(config.CFG_PATH.NET_CFG.NNA_NODE_JSON + ' delete success');
    }
    catch (err) {
        logger.debug(config.CFG_PATH.NET_CFG.NNA_NODE_JSON + ' no exists');
    }

    //NN Save
    if (role === define.NODE_ROLE.STR.NN)
    {
        //
        fs.writeFileSync(config.CFG_PATH.NET_CFG.NNA_RRNET_JSON, rrNet, config.CMD_ENCODING.encoding);
        logger.debug(role + ' : RR_NET Save Successful');

        //
        fs.writeFileSync(config.CFG_PATH.NET_CFG.NNA_NODE_JSON, node, config.CMD_ENCODING.encoding);
        logger.debug(role + ' : NODE Save Successful');
    }
    //Other Save
    else
    {
        loginfo = logger.dbn_Info;
        logger.debug(role + ' : It does NOT need NETCONF');
    }

    return role;
}

//
module.exports.cmdChildProcess = async (socket, msg, myRole) => {
    if (util.isJsonString(msg) === false)
    {
        return;
    }

    let msgJson = JSON.parse(msg);

    logger.info("Command from IS, myRole : " + myRole + ", msgJson.cmd : " + msgJson.cmd);
    logger.info("msgJson.data : " + JSON.stringify(msgJson.data));

    //
    let splitMsg = msgJson.cmd.split(' ');
    //
    if (splitMsg[0] === cmd.rsp_prr)
    {
        if (splitMsg[1] !== cmd.rsp_prr_cmd.passed)
        {
            socket.destroy();
        }
    }

    // 0. net reset
    if (msgJson.cmd === cmd.req_reset)
    {
        if (myRole == define.NODE_ROLE.STR.NN)
        {
            await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_reset);
        }

        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_reset);
    }
    // 1. net rerun
    else if (msgJson.cmd === cmd.req_rerun)
    {
        let appStatus1 = await util.getResultArr(define.APP_INFO.APP_STATUS_1);
        let appStatus2 = await util.getResultArr(define.APP_INFO.APP_STATUS_2);

        if (appStatus1.indexOf(define.APP_NAME.CPP) !== -1 || appStatus2.indexOf(define.APP_NAME.NODE) !== -1)
        {
            await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_rerun);
            await redisUtil.write(cmd.redis_cmd_noti, cmd.req_rerun);
        }
        else
        {
            await this.startNodeProcess(myRole);
        }
    }
    // 2. net update
    else if (msgJson.cmd === cmd.req_rr_update)
    {
        //
        let netDataJson = msgJson.data;
        logger.debug("netDataJson.data1 : " + netDataJson.data1);
        
        //
        await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_rr_update);
    }
    // 3. node start
    else if (msgJson.cmd === cmd.req_node_start)
    {
        //
        if(config.DB_TEST_MODE)
        {
            //
            await dbFB.truncateFbDB();
            
            //
            await dbNN.truncateScDB();
            await dbNN.truncateBlockDB();
            await dbNN.truncateAccountDB();
        }

        //
        await this.startNodeProcess(myRole);
    }
    // 4. block gen start
    // FIXME: check nna/conf/rr_net.json and last blk num
    else if (msgJson.cmd === cmd.req_bg_start)
    {
        let lastBN = await dbNNHandler.selectMaxBlkNumFromBlkContents();
        let RR_NET = JSON.parse(fs.readFileSync(config.CFG_PATH.NET_CFG.NNA_RRNET_JSON, 'binary'));
        let startBN = RR_NET.NET.TIER[0].START_BLOCK;
        if (Number(lastBN) + 1 == Number(startBN)) {
            logger.info(`== == == BLOCK GENERATION STARTS FROM ... ${startBN} == == ==`);
            await redisUtil.write(cmd.redis_cmd_noti, cmd.req_bg_start);
            await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_bg_start);
        } else {
            logger.error(`============== CHECK START BLOCK NUM: ${startBN}`)
            logger.error(`============== CHECK LAST BLOCK NUM: ${lastBN}`)
        }
    }
    // 5. block gen stop
    else if (msgJson.cmd === cmd.req_bg_stop)
    {
        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_bg_stop);
        await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_bg_stop);
    }
    // 6. Last Block Number
    else if (msgJson.cmd === cmd.req_last_bn)
    {
        let lastBN = await dbNNHandler.selectMaxBlkNumFromBlkContents();
        
        // Response
        netUtil.sendNetRspCmd(socket, util.getMyCtrlIP().toString(), cmdRedis.rsp_lastBN + ' ' + cmdRedis.rsp_lastBN_cmd.get, cmdRedis.status_cmd.rsp_complete, lastBN);
        // await redisUtil.write(cmd.redis_cmd_noti, cmd.req_last_bn);
    }
    // 7. rr next
    else if (msgJson.cmd === cmd.req_rr_next)
    {
        await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_rr_next);
    }
    // 8. node kill
    else if (msgJson.cmd === cmd.req_node_kill)
    {
        this.killNode();

        // 
        if(config.DB_TEST_MODE)
        {
            //
            await dbFB.truncateFbDB();
            
            //
            await dbNN.truncateScDB();
            await dbNN.truncateBlockDB();
            await dbNN.truncateAccountDB();
        }
    }
    // 9. net init
    else if (msgJson.cmd === cmd.req_net_init)
    {
        await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_net_init);
    }
    // 10. net save
    else if (msgJson.cmd === cmd.req_net_save)
    {
        //
        let netDataJson = msgJson.data;

        //
        let myRole = await this.saveNetConf(netDataJson);
        sock.setMyRole(myRole);
    }
    // 11. contract txs
    else if (msgJson.cmd === cmd.req_contract_txs)
    {
        let myContract = cmd.req_contract_txs + ' ' + JSON.stringify(msgJson.data);

        await redisUtil.write(cmd.redis_cmd_noti, myContract);
    }
    // 90. contract test
    else if (msgJson.cmd === cmd.req_contract_test)
    {
        let myContractTest = cmd.req_contract_test + ' ' + JSON.stringify(msgJson.data);

        await redisUtil.write(cmd.redis_cmd_noti, myContractTest);
    }
    // 12. block gen restart
    else if (msgJson.cmd === cmd.req_bg_restart)
    {
        await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_bg_restart);
    }
    // 20. db truncate
    else if (msgJson.cmd === cmd.req_db_truncate)
    {
        logger.info("DB Truncated");
        // Replication Reset
        logger.info("Replication Slave Stop");
        await dbRepl.stopReplSlaves();
        logger.info("Replication Slave Reset");
        await dbRepl.resetReplSlaves();

        //
        await dbFB.truncateFbDB();

        //
        await dbNN.truncateScDB();
        await dbNN.truncateBlockDB();
        await dbNN.truncateAccountDB();

        // //
        // await redisUtil.write(cmd.redis_ctrl_noti, cmd.req_db_truncate);
        // await redisUtil.write(cmd.redis_cmd_noti, cmd.req_db_truncate);
    }
    // 21. replication set
    else if (msgJson.cmd === cmd.req_db_repl_set)
    {
        let replSet = cmd.req_db_repl_set + ' ' + JSON.stringify(msgJson.data);

        await redisUtil.write(cmd.redis_cmd_noti, replSet);
    }
    // 22. replication get
    else if (msgJson.cmd === cmd.req_db_repl_get)
    {
        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_db_repl_get);
    }
    // 23. replication stop
    else if (msgJson.cmd === cmd.req_db_repl_stop)
    {
        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_db_repl_stop);
    }
    // 24. replication reset
    else if (msgJson.cmd === cmd.req_db_repl_reset)
    {
        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_db_repl_reset);
    }
    // 25. replication start
    else if (msgJson.cmd === cmd.req_db_repl_start)
    {
        await redisUtil.write(cmd.redis_cmd_noti, cmd.req_db_repl_start);
    }
    else
    {
        //
    }
}

// Node Kill
module.exports.killNode = () => {
    let killResult;

    logger.debug("func : killNode");
    
    let nodePS = execSync(define.APP_INFO.PS_NODE,  config.CMD_ENCODING)
    // logger.debug("nodePS : " + nodePS);

    if (nodePS !== '')
    {
        killResult = execSync(define.APP_INFO.KILL_NODE, config.CMD_ENCODING);
        if (killResult)
        {
            // logger
        }
    }

    logger.debug("killResult : " + killResult);
}

// Node Start
module.exports.startNode = async (role) => {
    logger.debug("func : startNode");
    logger.debug("role : " + role);

    // NN
    if (role === define.NODE_ROLE.STR.NN)
    {
        // NNA
        let result_cpp = spawn(config.NODE_PATH.shell, [config.NODE_PATH.scriptNodeStart, role], { cwd: config.NODE_PATH.scriptWhere, detached: true, stdio: config.NODE_PATH.stdio });
        if (config.APP_LOG & config.APP_LOG_KIND.CPP_LOG)
        {
            logger.debug("NNA Log Started");
            result_cpp.stdout.on('data', (data) => {
                applog.info(`[NNA] ${data}`);
            })
        }

        // SCA
        let result_node = spawn(config.NODE_PATH.shell, [config.NODE_PATH.scriptNodeStart, define.NODE_ROLE.STR.SCA], { cwd: config.NODE_PATH.scriptWhere, detached: true, stdio: config.NODE_PATH.stdio });
        if (config.APP_LOG & config.APP_LOG_KIND.SCA_LOG)
        {
            logger.debug("SCA Log Started");
            result_node.stdout.on('data', (data) => {
                applog.info(`[SCA] ${data}`);
            })
        }
    }
    // DBN
    else if (role === define.NODE_ROLE.STR.DBN)
    {
        let result_node = spawn(config.NODE_PATH.shell, [config.NODE_PATH.scriptNodeStart, define.NODE_ROLE.STR.DBN], { cwd: config.NODE_PATH.scriptWhere, detached: true, stdio: config.NODE_PATH.stdio });
        if (config.APP_LOG & config.APP_LOG_KIND.DBN_LOG)
        {
            result_node.stdout.on('data', (data) => {
                applog.info(`[DBN] ${data}`);
            })
        }
    }
}

module.exports.startNodeProcess = async (role) => {
    this.killNode();
    await this.startNode(role);
}
