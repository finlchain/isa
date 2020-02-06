const config = require('../../config/config.js');
const define = require('../../config/define.js');
var logger = require('tracer').colorConsole(config.loggerConfig);

module.exports.info = async (data) => {
    if (config.loggerUse > 0) {
        logger.info(data);
    }
};
module.exports.debug = async (data) => {
    if (config.loggerUse > 1) {
        logger.debug(data);
    }
};
module.exports.warn = async (data) => {
    if (config.loggerUse > 1) {
        logger.warn(data);
    }
};
module.exports.err = async (data) => {
    if (config.loggerUse > 0) {
        logger.error(data);
    }
};
module.exports.nn_Info = async (kind, req_data, res_data) => {
    if (config.loggerUse > 0) {
        if(kind == define.loggerKind.netconf)
            logger.info("[NN] [NETCONF] [" + req_data + "] " + res_data);
        else
            logger.info("[NN] [TCP] [RECV] [" + req_data + "] "+ res_data);
    }
};
module.exports.cn_Info = async (kind, req_data, res_data) => {
    if (config.loggerUse > 0) {
        if (kind == define.loggerKind.netconf)
            logger.info("[CN] [NETCONF] [" + req_data + "] " + res_data);
        else
            logger.info("[CN] [TCP] [RECV] [" + req_data + "] " + res_data);
    }
};
module.exports.dbn_Info = async (kind, req_data, res_data) => {
    if (config.loggerUse > 0) {
        if (kind == define.loggerKind.netconf)
            logger.info("[DBN] [NETCONF] " + res_data);
        else
            logger.info("[DBN] [TCP] [RECV] [" + req_data + "] " + res_data);
    }
};
module.exports.unknown_Info = async (kind, req_data, res_data) => {
    if (config.loggerUse > 0) {
        if (kind == define.loggerKind.netconf)
            logger.info("[UNKNOWN] [NETCONF] [" + req_data + "] " + res_data);
        else
            logger.info("[UNKNOWN] [TCP] [RECV] [" + req_data + "] " + res_data);
    }
};