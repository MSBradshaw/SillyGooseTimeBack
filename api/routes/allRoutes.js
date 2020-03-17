'use strict';
module.exports = function(app) {

	var db = require('../models/database');

	var controllers = require('../controllers/allControllers');

	// This line comes from https://enable-cors.org/server_expressjs.html
	// it is for enabling Cross Origin Resource Sharing
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // update to match the domain you will make the request from
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});

	/*
	Use when there is a post request to /users.
	This will add the user information in the body to the data base
	*/
	app.post('/users',function(req,res){
		controllers.add_user(req,res,db.db)
		console.log('Printing Users Table');
		db.db.all('SELECT * FROM users', function(err, table) {
		        console.log(table);
		    });
	});

	/*
	Use when there is a get request with a userid
	Sends back the JSONed version of the requested user's information
	*/
	app.get('/users/:userid',function(req,res){
		controllers.get_user(req,res,db.db)
	});

	// sends hello world if you do the homepage
	app.get('/', function (req, res) {
		res.send('Hello World!')
		console.log('Get request to homepage')
	})

	// sends hello world if you do the homepage
	app.post('/', function (req, res) {
		res.send('Posty McPost')
		console.log(req.body)
		console.log('Post request to homepage')
	})
	//db.db.close()
};
