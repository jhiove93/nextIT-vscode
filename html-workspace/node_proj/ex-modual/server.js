const db = require('./db');
console.log(db);

async function run(){
    const conn = await db.getConn();

    try{
        const sql1 = `SELECT department_id, department_name 
                      FROM departments 
                      WHERE department_id = :1`
        const result = await db.selectData(conn,sql1,[110]);
        console.log(result.rows);
        // insert
        const sql2 = `INSERT INTO departments (department_id, department_name )
                      VALUES(:id, :nm)`
        const result2 = await db.insertData(conn,sql2,{id:999 , nm:'새로운 부서'});
        console.log('insert cnt:',result2.rowsAffected);
    }catch(err){
        console.log('error:',err);
    }finally{
        await db.closeConn(conn);
    }




}
run();