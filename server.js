//I followed this tutorial and commented out all Mongo DB references

//https://www.codementor.io/@olatundegaruba/nodejs-restful-apis-in-10-minutes-q0sgsfhbd

var express = require('express'),
    app = express(),
    port = process.env.PORT || 8081,
    //Task = require('./api/models/todoListModel'), //created model loading here
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// This is to make public/uploads static and easily accessible for the front end
app.use(express.static(__dirname + '/public/uploads'));
app.listen(8082);


var routes = require('./api/routes/allRoutes'); //importing route
routes(app); //register the route


app.listen(port);


console.log('todo list RESTful API server started on: ' + port);
