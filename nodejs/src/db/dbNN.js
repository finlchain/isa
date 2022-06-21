//
const dbUtil = require('./../db/dbUtil.js');
const logger = require('./../utils/winlog.js');

//
const createTableNames = {
    scQuerys : [
        "sc_contents",
        "sc_delayed_txs",
    ],
    blockQuerys : [
        "blk_txs",
    ],
    blockShardQuerys : [
        "blk_contents",
    ],
    accountQuerys : [
        "account_tokens",
        "account_users",
        "account_ledgers",
        "account_balance",
        "account_sc",
    ]
}

//
module.exports.querys = {
    // sc database
    sc : {
        createSC : "CREATE DATABASE IF NOT EXISTS `sc`",
        useSC : "USE `sc`",
        truncateScContents : dbUtil.truncate(`sc.${createTableNames.scQuerys[0]}`),
        truncateScDelayedTxs : dbUtil.truncate(`sc.${createTableNames.scQuerys[1]}`),
        // truncateScContents : `TRUNCATE sc.${createTableNames.scQuerys[0]}`,
        // truncateScDelayedTxs : `TRUNCATE sc.${createTableNames.scQuerys[1]}`,
    }, 
    // block database
    block : {
        createBlock : "CREATE DATABASE IF NOT EXISTS `block`",
        useBlock : "USE `block`",
        truncateBlkTxs : dbUtil.truncate(`block.${createTableNames.blockQuerys[0]}`),
        truncateBlkContents : dbUtil.truncate(`block.${createTableNames.blockShardQuerys[0]}`),
        // truncateBlkTxs : `TRUNCATE block.${createTableNames.blockQuerys[0]}`,
        // truncateBlkContents : `TRUNCATE block.${createTableNames.blockShardQuerys[0]}`,

        blk_contents : {
            selectLastBlkNum : `SELECT MAX(blk_num) as max_blk_num FROM block.blk_contents`,
        },
    }, 
    // account database
    account : {
        createAccount : "CREATE DATABASE IF NOT EXISTS `account`",
        useAccount : "USE `account`",
        truncateAccountTokens : dbUtil.truncate(`account.${createTableNames.accountQuerys[0]}`),
        truncateAccountUsers : dbUtil.truncate(`account.${createTableNames.accountQuerys[1]}`),
        truncateAccountLedgers : dbUtil.truncate(`account.${createTableNames.accountQuerys[2]}`),
        truncateAccountBalance : dbUtil.truncate(`account.${createTableNames.accountQuerys[3]}`),
        truncateAccountSc : dbUtil.truncate(`account.${createTableNames.accountQuerys[4]}`),
        // truncateAccountTokens : `TRUNCATE account.${createTableNames.accountQuerys[0]}`,
        // truncateAccountUsers : `TRUNCATE account.${createTableNames.accountQuerys[1]}`,
        // truncateAccountLedgers : `TRUNCATE account.${createTableNames.accountQuerys[2]}`,
        // truncateAccountBalance : `TRUNCATE account.${createTableNames.accountQuerys[3]}`,
        // truncateAccountSc : `TRUNCATE account.${createTableNames.accountQuerys[4]}`,
    },
}

//
module.exports.truncateScDB = async () => {
    let sql;

    sql = this.querys.sc.truncateScContents;
    await dbUtil.query(sql);

    sql = this.querys.sc.truncateScDelayedTxs;
    await dbUtil.query(sql);
}

module.exports.truncateBlockDB = async () => {
    let sql;

    sql = this.querys.block.truncateBlkTxs;
    await dbUtil.query(sql);

    sql = this.querys.block.truncateBlkContents;
    await dbUtil.query(sql);
}

module.exports.truncateAccountDB = async () => {
    let sql;

    sql = this.querys.account.truncateAccountTokens;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountUsers;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountLedgers;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountBalance;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountSc;
    await dbUtil.query(sql);
}
