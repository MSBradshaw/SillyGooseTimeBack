'use strict';
const path = require("path");
const multer = require("multer");


module.exports = function(app) {

	var db = require('../models/database');

	var controllers = require('../controllers/allControllers');

	// This line comes from https://enable-cors.org/server_expressjs.html
	// it is for enabling Cross Origin Resource Sharing
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
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

	const storage = multer.diskStorage({
	   destination: "./public/uploads/",
	   filename: function(req, file, cb){
	      cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
	   }
	});

	const upload = multer({
	   storage: storage,
	   limits:{fileSize: 1000000},
	}).single("myImage");

	/*
	When creating or updating a user
	Everytime a new photo is uploaded it is sent here
	Send location of saved photo back as response
	*/
	app.post('/photos',function(req,res){
		console.log('Save Image')
		upload(req, res, (err) => {
			console.log("Request ---", req.body);
			console.log("Request file ---", req.file);//Here you get file.
			if(!err){
				console.log(req.file.path);
				// get just the name not the path
				let name = req.file.path.split('/', 10).pop()
				// send the name the picture was saved as
				return res.send(name);
			}
		});
	});


	/*
	When creating or updating a user
	Everytime a new photo is uploaded it is sent here
	Send location of saved photo back as response
	*/
	app.get('/photos/:filename',function(req,res){
		console.log(__dirname)
		var path = require('path');
		console.log(path.resolve('public/uploads/'+req.params['filename']))
		// /Users/michael/SillyGooseTimeBack/api/routes/../../public/uploads/img1.jpg
		console.log('Getting Photo: ' + path.resolve('public/uploads/'+req.params['filename']))
		res.sendFile(path.resolve('public/uploads/'+req.params['filename']));
	});

	/*
	Use when there is a get request with a userid
	Sends back the JSONed version of the requested user's information
	*/
	app.get('/users/:userid',function(req,res){
		controllers.get_user(req,res,db.db)
	});


	/*
	Used to authenticate login
	*/
	app.post('/login',function(req,res){
		console.log('Logging in')
		controllers.login(req,res,db.db)

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
