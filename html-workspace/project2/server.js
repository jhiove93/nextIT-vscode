const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./media'));
app.use(express.json());
const db = require('./db');
const fetch = require('node-fetch');

const port = 3000;
const url = require('url');
const cors = require('cors');
// app.use(cors({
//     origin : 'http://127.0.0.1:5500'
// }));
// 전체 오리진 허용
app.use(cors());

let conn;
async function dbrun() {
    conn = await db.getConn();
    console.log('db start');
}
dbrun();
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.get('/', async (req, res) => {
    res.render('login', { msg: 'N' });
});
app.get('/mainPage', async (req, res) => {
    res.render('main', { msg: 'N' });
});
app.get('/loginPage', async(req, res) => {
    res.render('login', {msg : 'N', id:''});
})
app.get('/newsPage', async(req, res) => {
    res.render('news', {msg : 'N', id:'',query:''});
})

///
// 암호화 모듈
// npm install bcrypt
let bcrypt = require('bcrypt');
let saltRounds = 10; // 단순 알고리즘에 반복적으로 랜덤하게 만드는... 쉽게 더 복잡하게 만드는 것
const sqlConfig = {
    user_info: `SELECT *
                                 FROM MD_USER
                                 WHERE user_id = :1
                                 `
    , user_insert: `INSERT INTO MD_USER
                                 VALUES(:user_id, :user_pw, :user_nm)`
    ,file_insert : `INSERT INTO files(file_seq , user_id, originalname, mimetype, f_size, destination, filename)
                    values (file_seq.nextval, :user_id , :originalname, :mimetype , :f_size, :destination ,:filename)`
    ,file_select : `select *
                    from files
                    where user_id =:1`
    // ,add_search_top :`select DISTINCT(region_top)
    //                     from address3`        
    ,add_search_top : `select *
                            from(
                                SELECT *
                                FROM address
                                WHERE region_name LIKE '%' || :1 || '%')
                        where region_name LIKE '%' || :2 || '%'`
                                }
app.post('/signup', async (req, res) => {
    console.log(req.body);
    const user_pw = await bcrypt.hash(req.body.user_pw, saltRounds);
    const user_id = req.body.user_id;
    const user_nm = req.body.user_nm;
    try {
        const result = await db.selectData(conn, sqlConfig.user_info, [user_id]);
        if (result.rows.length > 0) {
            return res.render('login', { msg: '동일한 아이디가 있음' });
        }
    } catch (error) {
        return res.render('login', { msg: '사이트 오류' });
    }
    console.log(user_pw);
    const val = { user_id, user_pw, user_nm };
    try {
        await db.insertData(conn, sqlConfig.user_insert, val);
        res.render('login', { id: user_id, msg: '회원가입 되셨습니다. 로그인 진행해주세요!' });
    } catch (error) {
        res.render('login', { msg: '사이트 오류' });
    }
});
app.post('/loginPage', async (req, res) => {
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
                    console.log(result.rows[0].USER_NM);
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





// app.post('/mypage', async(req ,res)=>{
//     let user_id = req.body.user_id;
//     try{
//         const result = await db.selectData(conn , sqlConfig.file_select, [user_id]);
//         res.render('mypage',{files:result.rows});
//     }catch(err){
//         res.render('main',{msg:'유저 정보가 잘못 되었습니다.',id:user_id});
//         console.log(err);
//     }
// });


/// 메인에서 검색한거 네이버api이용해서 뉴스로넘어가기
app.get('/search', async(req, res)=> {
    console.log(req.query);
    const apiUrl = new url.URL('https://openapi.naver.com/v1/search/news')
    // key value 찾아서 url 인코딩
    apiUrl.search =  new url.URLSearchParams({
         query : req.query.query
        ,display : req.query.display
    }).toString();
    // 네이버에 요청
    const response = await fetch(apiUrl, {
        method : 'GET'
        , headers : { 'X-Naver-Client-Id' : 'Wq43EqmWlZv8dQhk3h4X'
                       ,'X-Naver-Client-Secret' : 'ajSs98RdHh'
                       ,'Content-Type' : 'application/json'
        }
    });
        const data = await response.json();
        console.log(data);
        res.json(data);
});

//공공데이터 부동산 아파트

app.get('/search2', async(req, res)=> {
    console.log(req.query);
    const apiUrl = new url.URL('https://openapi.naver.com/v1/search/local')
    // key value 찾아서 url 인코딩
    apiUrl.search =  new url.URLSearchParams({
         query : req.query.query
        ,display : req.query.display
    }).toString();
    // 네이버에 요청
    const response = await fetch(apiUrl, {
        method : 'GET'
        , headers : { 'X-Naver-Client-Id' : 'Wq43EqmWlZv8dQhk3h4X'
                       ,'X-Naver-Client-Secret' : 'ajSs98RdHh'
                       ,'Content-Type' : 'application/json'
        }
    });
        const data = await response.json();
        console.log(data);
        res.json(data);
});

//공공데이터api 아파트실거래가
var request = require('request');
const xml2js = require('xml2js');
app.get('/search3', async (req, res) => {

    var inputDate = req.query.date; // 검색할때 받아온 날짜
    var address = req.query.add_top; // 커뮤니티에서 클릭해서 받아온 시명
    var address_mi = req.query.add_middle; // 클릭해서 받아온 구명

    //쿼리문조회하는거 
    let addcode;
    try{
        const result = await db.selectData(conn , sqlConfig.add_search_top,[address,address_mi]);
        console.log('쿼리문실행결과  : ',result.rows);
        addcode = result.rows[0].ADD_CODE;
        // res.render('community',{add_top:result.rows});
    }catch(err){
        // res.render('community',{msg:'검색결과가 잘못 되었습니다.'});
        console.log(err);
    }


    var url = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=GPt75PIq0VuRdeTvylhsSc4IrxY0Rev4stgIS7wJuVu9h14cy2J8lwO6fV2FW74ZyKgqfAxh%2BrYRfmdaA04E2A%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* */
    queryParams += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(addcode); /* */
    queryParams += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(inputDate); /* */

    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, xml) {
    
        // Convert XML to JSON
        xml2js.parseString(xml, (err, result) => {
            if (err) {
              console.error('Failed to parse XML:', err);
            } else {
              const json = JSON.stringify(result);
              console.log('Parsed XML:', json);
              res.send(json);
            }
          });
    });
});


app.get('/communityPage', async(req, res) => {
 res.render('community', {msg : 'N', id:''});
})




app.listen(port, () => {
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