//
const dbUtil = require('./../db/dbUtil.js');
const dbFB = require('./../db/dbFB.js');
const logger = require('./../utils/winlog.js');

//
module.exports.initDatabase = async () => {
    //
    await dbFB.initDatabaseFB(); // 
}
