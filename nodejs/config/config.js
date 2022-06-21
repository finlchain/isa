//
const fs = require('fs');

//
const cryptoSsl = require("./../../../addon/crypto-ssl");

//
const NETCONF_JSON = JSON.parse(fs.readFileSync("./../../conf/netconf.json"));

//
module.exports.KEY_PATH = {
    MY_KEY : NETCONF_JSON.DEF_PATH.KEY_ME + '/', 
    PW_SEED: NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SEED, 
    PW_MARIA : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.MARIA, 
    PW_REDIS : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REDIS, 
}

//
module.exports.INFO_PATH = {
    KEY_SEED : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA), 
}

// 
module.exports.CFG_PATH = {
    NODE_CFG : NETCONF_JSON.DEF_INFO.NODE_CFG, 
    NET_CFG : {
        NNA_PATH_JSON : NETCONF_JSON.NNA.PATH_JSON, 
        NNA_RRNET_JSON: NETCONF_JSON.NNA.RRNET_JSON, 
        NNA_NODE_JSON: NETCONF_JSON.NNA.NODE_JSON, 
    }, 
    MARIA : {
        DB_HOST : NETCONF_JSON.DB.MARIA.HOST, 
        DB_PORT : NETCONF_JSON.DB.MARIA.PORT, 
        DB_USER : NETCONF_JSON.DB.MARIA.USER, 
        PW_MARIA : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA),
    }, 
    REDIS : {
        HOST : NETCONF_JSON.DB.REDIS.HOST, 
        PORT : NETCONF_JSON.DB.REDIS.PORT, 
        PW_REDIS : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REDIS)
    }, 
}

module.exports.SOCKET_INFO = {
    BIND_ISA_SERVER_PORT: NETCONF_JSON.IS.SOCKET.ISA.SERVER.PORT, 
    BIND_ISA_SERVER_HOST: NETCONF_JSON.IS.SOCKET.ISA.SERVER.HOST,
    BIND_ISA_CLIENT_PORT: NETCONF_JSON.IS.SOCKET.ISA.CLIENT.PORT
}

module.exports.NODE_PATH = {
    // nn_cwd: '../nna',
    // sca_cwd: '../sca',
    // dn_cwd: '../dn',
    // dbn_cwd: '../dbn',
    
    cpp_start: './bin/node',
    node_start1: 'node',
    node_start2: 'main.js',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: 'bash',
    scriptNodeStart: './node_start.sh',
    scriptWhere: './bin'
}

// Version info
module.exports.paddy = (num, padLen, padChar) => {
    var pad_char = typeof padChar !== 'undefined' ? padChar : '0';
    var pad = new Array(1 + padLen).join(pad_char);

    return (pad + num).slice(-pad.length);
}

const getVerInfo = () => {
    //
    let mainVerInfo = '0';
    let subVerInfo = '0';

    //
    let lineArr = fs.readFileSync(this.CFG_PATH.NODE_CFG).toString().split('\n');

    for (idx in lineArr)
    {
        if (lineArr[idx].includes('VER_INFO_MAIN'))
        {
            mainVerInfo = lineArr[idx].split(' ')[2];
        }
        else if (lineArr[idx].includes('VER_INFO_SUB'))
        {
            subVerInfo = lineArr[idx].split(' ')[2];
        }
    }

    let verInfo = mainVerInfo + '.' + this.paddy(subVerInfo, 4);

    return verInfo;
}

//
module.exports.VERSION_INFO = getVerInfo();

module.exports.CMD_ENCODING = {
    encoding: 'utf8'
}

// APP Log
module.exports.APP_LOG_KIND = {
    NONE : 0,
    CPP_LOG : 1,
    SCA_LOG : 2,
    DN_LOG :4,
    DBN_LOG : 8
};

module.exports.APP_LOG = this.APP_LOG_KIND.CPP_LOG | this.APP_LOG_KIND.SCA_LOG;

// NN's path.json
const NN_NODE_JSON = JSON.parse(fs.readFileSync(this.CFG_PATH.NET_CFG.NNA_PATH_JSON));
module.exports.NN_NODE_JSON = NN_NODE_JSON;

// network key
module.exports.myKeyPathConfig = {
    prikey : NN_NODE_JSON.PATH.KEY.CONS.MY_KEY + NN_NODE_JSON.PATH.KEY.CONS.PRIKEY_NAME,
    pubkey : NN_NODE_JSON.PATH.KEY.CONS.MY_KEY + NN_NODE_JSON.PATH.KEY.CONS.PUBKEY_NAME
}

// Redis
module.exports.REDIS_CONFIG = {
    host : this.CFG_PATH.REDIS.HOST,
    port : parseInt(this.CFG_PATH.REDIS.PORT),
    password : this.CFG_PATH.REDIS.PW_REDIS,
}

module.exports.REDIS_CH = {
    CTRL_NOTI: 'ctrlNoti', // to NNA
    CMD_NOTI: 'cmdNoti', // to SCA
    CTRL_NOTI_ACKS: 'ctrlNotiAcks', // from NNA
    CMD_NOTI_ACKS: 'cmdNotiAcks' // From SCA
}

module.exports.MARIA_CONFIG = {
    host: this.CFG_PATH.MARIA.DB_HOST,
    port: this.CFG_PATH.MARIA.DB_PORT,
    user: this.CFG_PATH.MARIA.DB_USER,
    password: this.CFG_PATH.MARIA.PW_MARIA,
    supportBigNumbers : true,
    bigNumberStrings : true,
    connectionLimit : 10
};

//
// VM true? 1, false? 0
module.exports.IS_VM = 1;
module.exports.TEST_HW_INO = {
    CPU : "Test CPU",
    MEMSIZE : 8,
    MEMSPEED : 1200
};

// IP Control
module.exports.IP_ASSIGN = {
    CTRL : 1,
    DATA : 1,
    REPL : 1
};

module.exports.DB_TEST_MODE = false;
module.exports.DB_TEST_MODE_DROP = false;
