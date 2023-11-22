const express = require("express");
const api = require('./routes/api');
const route = require('./routes/route');
const bodyParser = require("body-parser");
const passport = require('passport');
const myDB = require('./routes/connection');
const flash = require('express-flash');

var app = express();
app.use('/public', express.static(process.cwd() + '/public'));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash())
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
  
app.use(passport.initialize());
app.use(passport.session());
 




myDB(async client => {
    const myDataBase = await client.db('test').collection('users'); 
    route(app, myDataBase);
    api(app, myDataBase);

})



const listener = app.listen(3000, function (){
    console.log('Your app is listening on port ' + listener.address().port)
});