const express = require('express');
const app = express();
const port = 3000;
// Embedded JavaScript templates
app.set('view engine', 'ejs');
app.listen(port, ()=>{
console.log('hi start');
});
app.get('/',(req,res)=> {
    let data = {nm:'Nick' , age:20};
    res.render('index', data);
});
app.get('/users',(req,res)=>{
    let users = [
        {id:1 , name : 'nick'}
        ,{id:2 , name : 'judy'}
        ,{id:3 , name : 'jack'}
    ];
    res.render('user',{users});
});