/*
Give a database connection
Get all places from the users Table
Set off a series of function calls to create new matches
*/
function get_all_places(db){
	console.log('getting all places and their activities');
	statment = "SELECT * FROM users WHERE type_of_user='place'";
	db.all(statment,function(err, table){
		console.log(table.length);
		var activities = []
		for(var i = 0; i < table.length;i++){
			activities.push()
			// this is me assuming that each place will only have 1 activity
			var thing = get_people_for_activity(db,table[i])
		}
	})
}

/*
Given a user object for one place
Create groups of people that all share the interest of that place
*/
function get_people_for_activity(db,place_obj){
	var statement = "SELECT * FROM users WHERE type_of_user='users' AND interests LIKE '%TERM%'";
	statement= statement.replace('TERM',place_obj['interests']);
	db.all(statement,function(err,table){
		console.log('Get all people interested in ' + place_obj['interests'] + ' near ' + place_obj['location'])
		groups = group_people(table);
		// generate matches
		generate_new_matches(db,place_obj,groups);
	});
	return 0;
}

// 100% stolen from https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/38571132
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

/*
Given the results of an sql query represetning users with a common interest.
Return a list of strings containing unique sets of userids
*/
function group_people(people){
	console.log('make groups of 3-5 people -- this should be people ids')
	// make an array of the indexes for people
	people_indexes = []
	for(var i =0; i < people.length;i++){
		people_indexes.push(people[i]['userid']);
	}
	// make groups of different sizes
	groups = []
	for(var i =3; i < 6;i++){
		// console.log('\tGroupings of ' + i)
		if( i > (people.length)){
			continue;
		}
		// make a random group of people for each person (so everyone is part of atleast 1 group)
		for(var j =0; j < people.length;j++){
			var temp_arr = [...people_indexes];
			var res = temp_arr.splice(j,1);
			var group = getRandom(temp_arr,i-1);
			group.push(people_indexes[j])
			group.sort()
			groups.push(group.toString())
			// console.log('\t\t' + group.toString())
		}
	}
	groups = [...new Set(groups)]
	return groups
}


/*
*/
function generate_new_matches(db,place_obj,groups){
	console.log('generating new matches')
	var statement = "INSERT INTO matches (people,place,activity,status) VALUES ('PEOPLE','PLACE','ACTIVITY','STATUS')"
	for(g in groups){
		group = groups[g].split(',')
		status = {}
		for(i in group){
			status[group[i]] = 'pending'
		}
		//console.log(status)
		var sql_statement = statement.replace('PEOPLE',groups[g])
		sql_statement = sql_statement.replace('PLACE',place_obj['userid'])
		sql_statement = sql_statement.replace('ACTIVITY',place_obj['interests'])
		sql_statement = sql_statement.replace('STATUS',JSON.stringify(status))
		//console.log(sql_statement)
		db.run(sql_statement,function(err){
			console.log('----------------last ID: ' + this.lastID)
			for(i in group){
				update_matches_for_user(db,group[i],this.lastID);
			}
		});
	}
}

/*
*/
function update_matches_for_user(db,userid,matchid){
	console.log('\tCreating match for user ' +userid )
	// get the user's current matches
	var update_statement = "UPDATE users SET matches=MATCHES WHERE userid=USERID"
	var select_statement = "SELECT * FROM users WHERE userid=" + parseInt(userid);
	db.all(select_statement,function(err,table){
		//append and update
		var matches_string = ''
		console.log('----------')
		if(table[0]['matches'] === null){
			matches_string = matchid
		}else{
			matches_string = table[0]['matches'] + ',' + matchid
		}
		console.log(matches_string)
		console.log('----------')
		var sql_update_statement = update_statement.replace('MATCHES',matches_string)
		sql_update_statement = sql_update_statement.replace('USERID',parseInt(userid))
		db.run(sql_update_statement);
	})
}

exports.make_matches = function(db){
	console.log('-----------Makeing Matches---------------');
	get_all_places(db);
	//
}
