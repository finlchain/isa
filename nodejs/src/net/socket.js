const net = require('net');
const public_ip = require('public-ip');
const datahandler = require('../net/datahandler.js');
const config = require('../../config/config.js');
const define = require('../../config/define.js');
const hwinfo = require('../hwinfo/hwinfo.js');
const netutil = require('../net/netutil.js');
const logger = require('../utils/logger.js');
const ip = require("ip");

let role;
let message = "";
let separator = define.socketArg.separator;
let retryCnt = 1;
let hwInfo;

let client = new net.Socket();
var intervalConnect = false;
var connectVal = false;

module.exports.ISClient = async function () {
    console.log(define.startMsg);
    // for VM Ware
    if (config.isVM == 1)
        localIP = await ip.address();
    else
        localIP = await public_ip.v4();

    client.setEncoding(config.cmdEncoding.encoding);
    hwInfo = await hwinfo.getHWInfo();

    client.on("connect", async function(){
        retryCnt = 1;
        tryConnect = true;
        connectVal = false;
        clearIntervalConnect();
        logger.info("[TCP] [IS] Connected");
        await netutil.writeData(client, hwInfo);
    })
    client.on("data", async function (data) {
        message += data.toString();

        let SeparatorIndex = message.indexOf(separator);
        let didComplete = SeparatorIndex != -1;

        if (didComplete) {
            let msg = message.slice(0, SeparatorIndex);
            message = message.slice(SeparatorIndex + 1);

            if (netutil.isJsonString(msg)) {
                role = await datahandler.saveNetConf(JSON.parse(msg));
            }
            else {
                await datahandler.cmdChildProcess(msg, role);
            }
        }
    });
    client.on("end", function () {
        logger.warn("[TCP] [IS] Client disconnected");
        // connectVal = false;
        // launchIntervalConnect("end")
    });
    client.on("error", function (err) {
        logger.err("[TCP] [IS] " + "Socket Error : ", JSON.stringify(err));
        // launchIntervalConnect("error")
    });
    // this.on("timeout", function () {
    //     logger.warn("[TCP] [IS] " + "Socket Timed Out");
    // });
    client.on("close", function () {
        logger.info("[TCP] [IS] " + "Socket Closed");
        if (!connectVal){
            connectVal = true;
            launchIntervalConnect("close");
        }
    });

    connect();
    return client;
}

function connect() {
    logger.info("[TCP] [IS] Try Connection (Count : " + retryCnt + ")");
    client.connect({
        port: config.tcpClient.is_port,
        host: config.tcpClient.is_host,
        localAddress: localIP,
        localPort: config.tcpClient.is_localport
    })
}

function launchIntervalConnect(kind) {
    if(kind == "close") retryCnt++;
    if (intervalConnect) return;
    intervalConnect = setInterval(connect, 5000);
}

function clearIntervalConnect() {
    if (!intervalConnect) return;
    clearInterval(intervalConnect);
    intervalConnect = false;
}