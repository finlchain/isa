const socket = require('./src/net/socket.js');
const redisutil = require('./src/net/redisutil.js');

const main = async() => {
  let isa = await socket.ISClient();
  redisutil.setRedis(isa);
}

main();

