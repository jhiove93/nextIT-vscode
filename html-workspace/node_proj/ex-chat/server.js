const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('./public'));
// 메인 
app.get('/', (req, res) => {
    res.render('index');
});
      //접속했을시 
io.on('connection', (socket)=>{
    // emit 현재 연결한 상대에게 신호를 보냄 
    io.emit('usercount', io.engine.clientsCount);
    console.log( io.engine.clientsCount);
    // on 함수를 이용하여 수신 
    socket.on('message', (msg)=>{
        console.log( '메세지 수신', msg);
        // 연결된 모든 소켓들에게 신호를 보냄 
        io.emit('message',msg);
    });
    socket.on('usercount',(cnt)=>{
        // 연결된 모든 소켓에게 전송
        io.emit('usercount',cnt);
    });
    socket.on('disconnect', ()=>{
        console.log('접속 종료');
    });
});
server.listen(3000, ()=>{
    console.log('server start');
});