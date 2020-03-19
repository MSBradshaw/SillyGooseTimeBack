'use strict';

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

exports.add_user = function(req, res, db) {
	console.log('Adding User');
	console.log('---------------');
	console.log(req.body);
	console.log('---------------');
	// format the query
	let query = "INSERT INTO users (name,email,password,interests,location,picture_path,bio) "+
	"VALUES ('"+clean_for_sql(req.body['name'])+"',"+
	"'"+clean_for_sql(req.body['email'])+"',"+
	"'"+clean_for_sql(req.body['password'])+"',"+
	"'"+clean_for_sql(req.body['interests'])+"',"+
	"'"+clean_for_sql(req.body['location'])+"',"+
	"'"+clean_for_sql(req.body['picture_path'])+"',"+
	"'"+clean_for_sql(req.body['bio'])+"')";

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
			res.send(JSON.stringify(table))
		});
	console.log(results)
	// res.send('Recieved: Getting User')
};
