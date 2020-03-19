'use strict';

exports.add_user = function(req, res, db) {
	console.log('Adding User');
	console.log('---------------');
	console.log(req.body);
	console.log('---------------');
	// format the query
	let query = "INSERT INTO users (name,email,password,interests,location,picture_path,bio) "+
	"VALUES ('"+req.body['name']+"',"+
	"'"+req.body['email']+"',"+
	"'"+req.body['password']+"',"+
	"'"+req.body['interests']+"',"+
	"'"+req.body['location']+"',"+
	"'"+req.body['picture_path']+"',"+
	"'"+req.body['bio']+"')";

	console.log(query);

	// run the query
	db.run(query);

	// send this back to the requester so they know what happened
	res.send('Recieved: Adding User');
};

exports.get_user = function(req, res,db) {
	console.log('Getting User id:' + req.params['userid'])
	let query = "SELECT * FROM users WHERE userid="+req.params['userid']
	let results = ""
	db.all(query, function(err, table) {
			results = table
			console.log(table);
			res.send('Recieved: Getting User' + JSON.stringify(table))
		});
	console.log(results)
	// res.send('Recieved: Getting User')
};
