const oracledb = require('oracledb');
const dbConfig = require('./config/dbconfig');

async function getConn(){
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        console.log('conn start');
    }catch(err){
        console.log('conn failed',err);
    }
    return conn;
}

async function selectData(conn,sql,binds=[]){
    return await conn.execute(sql, binds ,{outFormat : oracledb.OUT_FORMAT_OBJECT});
}
async function insertData(conn,sql,binds={}){
    return await conn.execute(sql, binds ,{autoCommit : true});
}


async function closeConn(conn){
    if(conn){
        try{
            await conn.close();
        }catch(err){
            console.log('error close',err);
        }
    }
}


module.exports = {
    getConn
    ,closeConn
    ,selectData
    ,insertData
}