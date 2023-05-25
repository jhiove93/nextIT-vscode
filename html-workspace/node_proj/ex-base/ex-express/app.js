const express = require('express');
const app = express();
const path = require('path');
//express.static 함수는 정적 파일들이 위치한 디렉터리를 인수로 받아
// 해당 디렉터리의 파일들을 URL 경로로 접근할 수 있게 합니다.
app.use(express.static('./public'));
// __dirname 현재 경로
app.get('/', function(req, res) {
res.sendFile(path.join(__dirname + '/index.html'));
});
// express
// 서버 측에서 데이터를 동적으로 HTML에 포함시키는 것이 불가능.
// 이런 경우에는 EJS나 다른 템플릿 엔진의 사용이 필요.
app.get('/main', function(req, res) {
res.sendFile(path.join(__dirname + '/views/main.html'));
});
app.listen(3000, function() {
console.log('App is listening on port 3000');
});