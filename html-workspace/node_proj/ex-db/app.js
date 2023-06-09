const express = require('express');
const oracledb = require('oracledb');
const app = express();

app.set('view engine', 'ejs');
//oracle 정보
const dbConfig = {
    user : 'java'
    ,password : 'oracle'
    ,connectString : '127.0.0.1:1521/XE'
}
app.get('/',async(req,res)=>{
    let conn;
    try{
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(`SELECT * FROM employees`);
        res.render('index',{data:result.rows});
        
    }catch(err){
        console.log(err);
        res.status(500).send('error');
    }finally{
        if(conn){
            try{
                await conn.close();
            }catch(e){
                console.log(e);
            }
        }
    }

});
app.get('/emp/:emp_id', async(req,res)=>{
    let conn;
    try{
        const emp_id = req.params.emp_id;
        conn = await oracledb.getConnection(dbConfig);
        // :1 :2 위치 바인딩
        // :emp_id :nm 이름 바인딩
        const result = await conn.execute("SELECT * FROM employees WHERE employee_id = :1",[emp_id]);
        res.render('index',{data : result.rows});
    }catch(err){
        console.log(err);
        res.status(500).send('error');
    }finally{
        if(conn){
            try{
                await conn.close();
            }catch(e){
                console.log(e);
            }
        }
    }
});
app.listen(3000,()=>{
    console.log('start server');
});