const express = require('express')
const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.listen(port, ()=>{
    console.log('start !!');
});
app.get('/',(req,res)=>{
    res.render('content');
});