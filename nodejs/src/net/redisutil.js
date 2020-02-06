const redis = require('redis');
const config = require('../../config/config.js');
const define = require('../../config/define.js')
const logger = require('../utils/logger.js');
const netutil = require('../net/netutil.js');
const ip = require("ip");
const cmdRedis = define.cmdRedis;

let publisher;
let consCmdNotiSubscriber;
let cmdNotiSubscriber;

module.exports.setRedis = async function (socket) {
    publisher = redis.createClient(config.redisConfig);
    consCmdNotiSubscriber = redis.createClient(config.redisConfig);
    cmdNotiSubscriber = redis.createClient(config.redisConfig);

    //subscribe -> waitting response FROM SCA
    consCmdNotiSubscriber.on("message", async function (channel, response_message) {
        logger.debug(" [SUB] [" + channel + "] " + response_message);
        // NN Start, CN Start
        if (response_message.split(cmdRedis.split_space)[1] == cmdRedis.req_start) {
            let start_res = {
                ip: ip.address().toString(),
                role: response_message.split(cmdRedis.split_space)[cmdRedis.kind],
                status: cmdRedis.res_start
            }
            await netutil.writeData(socket, JSON.stringify(start_res));
        }
        // rr update, next, start, stop, leave all .. complete
        else if (response_message.split(cmdRedis.split_space)[2] == cmdRedis.req_complete) {
            let suc_res = {
                ip: ip.address().toString(),
                kind: response_message.split(cmdRedis.split_space)[cmdRedis.kind] + cmdRedis.split_space + response_message.split(cmdRedis.split_space)[1],
                status: response_message.split(cmdRedis.split_space)[2]
            }
            await netutil.writeData(socket, JSON.stringify(suc_res));
        }
        else {
            logger.err("invalid redis form");
        }
    });
    consCmdNotiSubscriber.subscribe(config.redisChannel.ctrlnotiAcks);

    cmdNotiSubscriber.on("message", async function (channel, response_message) {
        logger.debug(" [SUB] [" + channel + "] " + response_message);
        let splitMsg = response_message.split(cmdRedis.split_space);
        let msgKind = splitMsg[cmdRedis.kind];
        if (msgKind == cmdRedis.req_contract) {
            let suc_res = {
                ip: ip.address().toString(),
                kind: msgKind,
                status: splitMsg[cmdRedis.status]
            }
            await netutil.writeData(socket, JSON.stringify(suc_res));
        }
        else if (msgKind == cmdRedis.req_sca) {
            let replNoti = cmdRedis.res_replSet1 + ip.address().toString() + cmdRedis.split_space + splitMsg[cmdRedis.res_replSet2] + cmdRedis.split_space + splitMsg[cmdRedis.res_replSet3];
            await netutil.writeData(socket, replNoti);
        }
        else if (msgKind == cmdRedis.req_dn || msgKind == cmdRedis.req_dbn) {
            let start_res = {
                ip: ip.address().toString(),
                role: msgKind,
                status: cmdRedis.res_start
            }
            await netutil.writeData(socket, JSON.stringify(start_res));
        }
        else if (msgKind == cmdRedis.req_reward) {
            let reward_res;
            if (splitMsg[cmdRedis.detail_kind] == cmdRedis.req_reward_spread) {
                reward_res = {
                    ip: ip.address().toString(),
                    kind: msgKind + cmdRedis.split_space + splitMsg[cmdRedis.detail_kind],
                    status: splitMsg[cmdRedis.detail_kind_status]
                }
            }
            else {
                reward_res = {
                    ip: ip.address().toString(),
                    kind: msgKind,
                    status: splitMsg[cmdRedis.status]
                }
            }
            await netutil.writeData(socket, JSON.stringify(reward_res));
        }
    });
    cmdNotiSubscriber.subscribe(config.redisChannel.cmdnotiAcks);
}

module.exports.write = async function (channel, data) {
    //publish -> send to data
    if (channel == config.redisChannel.ctrlnoti) {
        logger.info(" [PUB] [" + channel + "] " + data);
        await publisher.publish(channel, data);
    }
    else if (channel == config.redisChannel.cmdnoti) {
        logger.info(" [PUB] [" + channel + "] " + data);
        await publisher.publish(channel, data);
    }
}
