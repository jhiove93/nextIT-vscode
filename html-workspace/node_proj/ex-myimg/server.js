const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.json());
const db = require('./db');
let conn;
async function dbrun() {
    conn = await db.getConn();
    console.log('db start');
}
dbrun();
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.get('/', async (req, res) => {
    res.render('sign', { msg: 'N' });
});
app.get('/loginPage', async(req, res) => {
    res.render('login', {msg : 'N', id:''});
})
// 암호화 모듈
// npm install bcrypt
let bcrypt = require('bcrypt');
let saltRounds = 10; // 단순 알고리즘에 반복적으로 랜덤하게 만드는... 쉽게 더 복잡하게 만드는 것
const sqlConfig = {
    user_info: `SELECT *
                                 FROM MD_USER
                                 WHERE user_id = :1`
    , user_insert: `INSERT INTO MD_USER
                                 VALUES(:user_id, :user_pw, :user_nm)`
    ,file_insert : `INSERT INTO files(file_seq , user_id, originalname, mimetype, f_size, destination, filename)
                    values (file_seq.nextval, :user_id , :originalname, :mimetype , :f_size, :destination ,:filename)`
    ,file_select : `select *
                    from files
                    where user_id =:1`}
app.post('/signup', async (req, res) => {
    console.log(req.body);
    const user_pw = await bcrypt.hash(req.body.user_pw, saltRounds);
    const user_id = req.body.user_id;
    const user_nm = req.body.user_nm;
    try {
        const result = await db.selectData(conn, sqlConfig.user_info, [user_id]);
        if (result.rows.length > 0) {
            return res.render('sign', { msg: '동일한 아이디가 있음' });
        }
    } catch (error) {
        return res.render('sing', { msg: '사이트 오류' });
    }
    console.log(user_pw);
    const val = { user_id, user_pw, user_nm };
    try {
        await db.insertData(conn, sqlConfig.user_insert, val);
        res.render('login', { id: user_id, msg: '회원가입 되셨습니다. 로그인 진행해주세요!' });
    } catch (error) {
        res.render('sign', { msg: '사이트 오류' });
    }
});
app.post('/login', async (req, res) => {
    const user_id = req.body.user_id;
    try {
        const result = await db.selectData(conn, sqlConfig.user_info, [user_id]);
        if (result.rows.length > 0) {
            bcrypt.compare(req.body.user_pw, result.rows[0].USER_PW, function (err, isMatch) {
                if (err) {
                    console.log(err);
                } else if (isMatch) {
                    // 입력받은 값과 db pw 일치했을때 true
                    res.render('main', {msg : '로그인 되었습니다.', id:user_id});
                } else {
                    res.render('login', {msg : '비밀번호가 다릅니다', id:user_id});
                }
            });
        }else{
            res.render('login', {msg : '잘못된 회원 아이디 입니다', id : ''})
        }
    }catch (e) {
    console.log(e)
}
});

/// 이미지 저장관련
// npm install multer 
const multer = require('multer');
//첨부파일 저장경로 
app.use('./uploads',express.static('./uploads'));
// multer 설정(파일 저장을 도와주는 모듈)
const storage = multer.diskStorage({
    destination : (req,file, cb) =>{
        cb(null,'uploads/')
    },
    filename : (req,file,cb)=>{
        cb(null,file.fieldname +'-' + Date.now()); // 저장 파일명
    }
});
const upload = multer({storage : storage});
app.post('/upload',upload.single('myfile'), async(req,res)=>{
    const file = req.file;
    const meta = {
        user_id : req.body.user_id
        ,originalname : file.originalname
        ,mimetype : file.mimetype
        ,f_size : file.size
        ,destination : file.destination
        ,filename : file.filename
    }
    console.log(meta);
    try{
        const result = await db.insertData(conn,sqlConfig.file_insert, meta);
        console.log('insert rowcnt : ' + result.rowsAffected);
    }catch(err){
        console.log(err);
    }
    res.render('main',{msg:'저장되었습니다.',id:req.body.user_id});
});

app.post('/mypage', async(req ,res)=>{
    let user_id = req.body.user_id;
    try{
        const result = await db.selectData(conn , sqlConfig.file_select, [user_id]);
        res.render('mypage',{files:result.rows});
    }catch(err){
        res.render('main',{msg:'유저 정보가 잘못 되었습니다.',id:user_id});
        console.log(err);
    }
});


///



app.listen(3333, () => {
    console.log('start!!!');
});
process.on('SIGINT', async () => {
    // CTRL+C
    console.log('SIGINT closing db');
    await db.closeConn(conn);
    process.exit(0);
});
process.on('SIGTERM', async () => {
    // kill
    console.log('SIGTERM closing db');
    await db.closeConn(conn);
    process.exit(0);
});