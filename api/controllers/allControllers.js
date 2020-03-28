'use strict';

// replace special characters with escaped ones to make them non-breaking for SQL statements
function clean_for_sql (str) {
	if(typeof str === 'undefined' ){
		return "";
	}
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
			case "'":
				return "''"
            case "\"":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
            default:
                return char;
        }
    });
}

// create a random id
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

exports.add_user = function(req, res, db) {
	console.log('Adding User');

	// format the query
	let query = "INSERT INTO users (name,email,password,interests,location,picture_path,type_of_user,bio) "+
	"VALUES ('"+clean_for_sql(req.body['name'])+"',"+
	"'"+clean_for_sql(req.body['email'])+"',"+
	"'"+clean_for_sql(req.body['password'])+"',"+
	"'"+clean_for_sql(req.body['interests'])+"',"+
	"'"+clean_for_sql(req.body['location'])+"',"+
	"'"+clean_for_sql(req.body['picture_path'])+"',"+
	"'"+clean_for_sql(req.body['type_of_user'])+"',"+
	"'"+clean_for_sql(req.body['bio'])+"')";

	console.log(query);

	// run the query
	db.run(query);

	// send this back to the requester so they know what happened
	res.send('Recieved: Adding User');
};

exports.update_user = function(req, res, db) {
	console.log('Updating User');

	// format the query
	let query = "UPDATE users SET name='NAME',email='EMAIL',password='PASSWORD',interests='INTERESTS',location='LOCATION',picture_path='PICTURE',bio='BIO' WHERE userid=ID"
	query = query.replace('NAME',clean_for_sql(req.body['name']));
	query = query.replace('EMAIL',clean_for_sql(req.body['email']));
	query = query.replace('PASSWORD',clean_for_sql(req.body['password']));
	query = query.replace('INTERESTS',clean_for_sql(req.body['interests']));
	query = query.replace('LOCATION',clean_for_sql(req.body['location']));
	query = query.replace('PICTURE',clean_for_sql(req.body['picture_path']));
	query = query.replace('BIO',clean_for_sql(req.body['bio']));
	query = query.replace('ID',req.body['userid']);
	// run the query
	db.run(query);

	// send this back to the requester so they know what happened
	res.send('Recieved: Updating User');
};

exports.get_user = function(req, res,db) {
	console.log('Getting User id:' + req.params['userid'])
	let query = "SELECT * FROM users WHERE userid="+req.params['userid']
	let results = ""
	db.all(query, function(err, table) {
			results = table
			console.log(table);
			res.send(JSON.stringify(table))
		});
	console.log(results)
};


exports.get_user_matches = function(req, res, db){
	console.log(req.body['userid'])
	var statement = "SELECT * FROM matches WHERE (people LIKE 'ID,%') OR (people LIKE '%,ID,%') OR (people LIKE '%,ID')"
	var sql_statement = statement.replace(/ID/g,req.body['userid'])

	db.all(sql_statement,function(err, activity_table){
		var people = []
		for(var i in activity_table){
			people = people.concat(activity_table[i]['people'].split(','))
		}
		for(var i in activity_table){
			people = people.concat(activity_table[i]['place'])
		}
		people = [...new Set(people)]
		// now select all the people that are related to this activity
		console.log(people.toString())
		var users_statement = "SELECT userid,name,picture_path,type_of_user FROM users WHERE userid IN (PEOPLE)"
		users_statement = users_statement.replace('PEOPLE',people.toString())
		db.all(users_statement,function(err,users_table){
			console.log(users_table)
			res.send({'matches':activity_table,'users':users_table})
		})

	})
}

exports.get_match = function(req, res, db){
	var id = req.params['match_id']
	var statement = "SELECT * FROM matches WHERE match_id=ID"
	var sql_statement = statement.replace(/ID/g,id)
	db.all(sql_statement,function(err, activity_table){
		console.log(activity_table)
		var people = []
		for(var i in activity_table){
			people = people.concat(activity_table[i]['people'].split(','))
		}
		for(var i in activity_table){
			people = people.concat(activity_table[i]['place'])
		}
		people = [...new Set(people)]
		// now select all the people that are related to this activity
		console.log(people.toString())
		var users_statement = "SELECT userid,name,picture_path,type_of_user,email FROM users WHERE userid IN (PEOPLE)"
		users_statement = users_statement.replace('PEOPLE',people.toString())
		db.all(users_statement,function(err,users_table){
			console.log(users_table)
			res.send({'matches':activity_table,'users':users_table})
		})

	})
}

exports.update_user_matches = function(req, res, db){
	console.log(req.body['userid'])
	// get the status is the users in the match
	var statement = "SELECT status FROM matches WHERE match_id=ID"
	statement = statement.replace('ID',req.body['match_id'])
	db.all(statement,function(err,table){
		var status = JSON.parse(table[0]['status'])
		console.log(status)
		status[req.body['userid'].toString()] = req.body['status']
		status = JSON.stringify(status)
		statement = "UPDATE matches SET status='STATUS' WHERE match_id=ID"
		statement = statement.replace('STATUS',status)
		statement = statement.replace('ID',req.body['match_id'])
		console.log(statement)
		db.run(statement,function(){
			res.send('Updated')
		})
	})
}

/*
Delete all previous tokens for a given user
*/
function clean_auth_table_for_user(db,id){
	let query = "DELETE FROM authorization WHERE userid="+id+""
	console.log(query)
	db.run(query)
}

exports.login = function(req, res,db) {
	console.log(req.body)
	// get the user with the email
	// compare passwords
	let query = "SELECT * FROM users WHERE email='"+req.body['email']+"'"
	let results = ""
	console.log(query)
	db.all(query, function(err, table) {
		console.log(table)
			if(table[0]['password'] === req.body['password']){
				// make an authorization toke of 16 random digits and characters
				let auth_token = makeid(16)
				var time = Date.now()
				// delete all old auth tokens belonging to the user
				clean_auth_table_for_user(db,table[0]['userid'])
				// add the key to the table
				let query2 = "INSERT INTO authorization (token, userid, time_issued) VALUES ('"+
				auth_token+"',"+table[0]['userid']+",'"+time+"')"
				console.log(query2)
				db.all(query2,function(err,table){})
				// send the key back to the front end
				var json = JSON.stringify({auth:auth_token,id:table[0]['userid']})
				res.send(json)
			}else{
				res.send(401, 'Email or password incorrect')
			}
		});
};
