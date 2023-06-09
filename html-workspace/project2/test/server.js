// npm install node-fetch@2
// npm install cors
// npm install express
// npm install ejs
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
const url = require('url');
const cors = require('cors');
// 특정 오리진 허용
app.use(cors({
    origin : 'http://127.0.0.1:5500'
}));
// 전체 오리진 허용
// app.use(cors());
app.get('/',async(req,res)=>{
    res.render('test');
});

app.get('/', async(req, res)=> {
    console.log(req.query);
    const apiUrl = new url.URL('http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcSHTrade')
    // key value 찾아서 url 인코딩
    apiUrl.search =  new url.URLSearchParams({
        query : req.query.query
        ,display : req.query.display
    }).toString();
    // 에 요청
    const response = await fetch(apiUrl, {
        method : 'GET'
        , headers : { 'serviceKey':'GPt75PIq0VuRdeTvylhsSc4IrxY0Rev4stgIS7wJuVu9h14cy2J8lwO6fV2FW74ZyKgqfAxh%2BrYRfmdaA04E2A%3D%3D'
                    , 'LAWD_CD':'11110'
                    , 'DEAL_YMD': '201512'
        }
    });
        const data = await response.json();
        console.log(data);
        res.json(data);
});
app.listen(port, ()=> {
    console.log('start');
});