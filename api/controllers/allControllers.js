'use strict';

// replace special characters with escaped ones to make them non-breaking for SQL statements
function clean_for_sql(str) {
    if (typeof str === 'undefined') {
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
                return "\\" + char; // prepends a backslash to backslash, percent,
                                    // and double/single quotes
            default:
                return char;
        }
    });
}

// create a random id
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
function group_people(people,userid) {
    console.log('make groups of 3-5 people -- this should be people ids')
    // make an array of the indexes for people
    let people_indexes = []
    for (var i = 0; i < people.length; i++) {
        people_indexes.push(people[i]['userid']);
    }
    // make groups of different sizes
    var groups = []
    for (var i = 2; i < 5; i++) {
        // console.log('\tGroupings of ' + i)
        if (i > (people.length)) {
            continue;
        }
        // make a random group of people for each person (so everyone is part of atleast 1 group)
        for (var j = 0; j < people.length; j++) {
            var temp_arr = [...people_indexes];
            var res = temp_arr.splice(j, 1);
            var group = getRandom(temp_arr, i - 1);
            group.push(people_indexes[j])
            group.push(userid)
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
function generate_new_matches(db, place_obj, groups) {
    console.log('generating new matches')
    var statement = "INSERT INTO matches (people,place,activity,status) VALUES ('PEOPLE','PLACE','ACTIVITY','STATUS')"
    for (var g in groups) {
        var group = groups[g].split(',')
        var status = {}
        for (var i in group) {
            status[group[i]] = 'pending'
        }
        //console.log(status)
        var sql_statement = statement.replace('PEOPLE', groups[g])
        sql_statement = sql_statement.replace('PLACE', place_obj['userid'])
        sql_statement = sql_statement.replace('ACTIVITY', place_obj['interests'])
        sql_statement = sql_statement.replace('STATUS', JSON.stringify(status))
        //console.log(sql_statement)
        db.run(sql_statement, function (err) {
            console.log('----------------last ID: ' + this.lastID)
            for (var i in group) {
                update_matches_for_user(db, group[i], this.lastID);
            }
        });
    }
}

/*
*/
function update_matches_for_user(db, userid, matchid) {
    console.log('\tCreating match for user ' + userid)
    // get the user's current matches
    var update_statement = "UPDATE users SET matches='MATCHES' WHERE userid=USERID"
    var select_statement = "SELECT * FROM users WHERE userid=" + parseInt(userid);
    db.all(select_statement, function (err, table) {
        //append and update
        var matches_string = ''
        console.log('----------')
        if (table[0]['matches'] === null) {
            matches_string = matchid
        } else {
            matches_string = table[0]['matches'] + ',' + matchid
        }
        console.log(matches_string)
        console.log('----------')
        var sql_update_statement = update_statement.replace('MATCHES', matches_string)
        sql_update_statement = sql_update_statement.replace('USERID', parseInt(userid))
        console.log('Final statement')
        console.log(sql_update_statement)
        db.all(sql_update_statement,function(err,table){
            db.all('SELECT * FROM matches',function(err,table){
                console.log('All Matches')
                console.log(table)
            })
        });
        // todo remove all matches old matches and see if the new ones here work
    })
}

function get_people_for_activity(interest,userid,place_obj,db){
    // let template = "SELECT *  FROM users WHERE interests LIKE 'INTEREST' and type_of_user='users';"
    // let template = "SELECT *  FROM users WHERE interests LIKE 'INTEREST' AND type_of_user='users';"
    let template = "SELECT *  FROM users WHERE type_of_user='users' AND interests LIKE '%INTEREST%';"
    let statement = template.replace('INTEREST',interest);
    db.all(statement,function(err, table){
        if(err){
            console.log(err.message)
        }
        console.log('--We the people--');
        // make sure there are enough people to form groups
        if(table.length < 3){
            console.log('Not enough people to form a group to do ' + interest + ' with userid ' + userid)
            return None;
        }
        // console.log(table);
        var groups = group_people(table,userid);
        console.log(groups)
        // choose a random 3 groups
        var choosen_groups = [];
        if(groups.length > 3){
            var choosen_groups = getRandom(groups,3);
        }else{
            // there are less than or equal to 3 groups so do all of them
            choosen_groups = groups;
        }
        // make the matches for the groups!
        generate_new_matches(db,place_obj,choosen_groups);
    })
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/*Find the places where you can do that activity.
If there are no places to do that activity you make matches for it*/

function get_places_for_activity(interest,userid,db){
    let template = "SELECT * FROM users WHERE type_of_user='place' AND interests LIKE '%INTEREST%';"
    let statement = template.replace('INTEREST',interest)
    console.log(statement)
    db.all(statement,function(err, table){
        if (err) {
            console.error(err.message);
        }
        console.log('--PLACES--');
        console.log(table)
        if(table.length == 0){
            console.log('No places');
        }else{
            console.log('There are places');
            // chose one of the places at random
            let index = getRandomInt(table.length - 1)
            // find people to do the activity with
            get_people_for_activity(interest,userid,table[index],db)
        }
    })
}


/*Given a user's email and a db connection
Get the userid and their interests
Call other function to make matches with other users for each interest
*/

function make_matches_for_user(email,db){
    // get the user's ID and interests
    let template = "SELECT userid,interests FROM users WHERE email='EMAIL'"
    let statement = template.replace('EMAIL',email);

    db.all(statement, function (err, table) {
        if (err) {
            console.error(err.message);
        }
        console.log('****')
        let id = table[0]['userid'];
        let interests = table[0]['interests'];
        // split interests into an array
        interests = interests.replace(/ /g,'');
        let interests_array = interests.split(',');
        console.log(interests_array);
        // for each interest find users that share this interest
        for(var i in interests_array){
            get_places_for_activity(interests_array[i],id,db)
        }
    });
}

exports.add_user = function (req, res, db) {
    console.log('Adding User');

    // format the query
    let query = "INSERT INTO users (name,email,password,interests,location,picture_path,type_of_user,bio) " +
        "VALUES ('" + clean_for_sql(req.body['name']) + "'," +
        "'" + clean_for_sql(req.body['email']) + "'," +
        "'" + clean_for_sql(req.body['password']) + "'," +
        "'" + clean_for_sql(req.body['interests']) + "'," +
        "'" + clean_for_sql(req.body['location']) + "'," +
        "'" + clean_for_sql(req.body['picture_path']) + "'," +
        "'" + clean_for_sql(req.body['type_of_user']) + "'," +
        "'" + clean_for_sql(req.body['bio']) + "')";

    console.log(query);

    // run the query
    db.run(query);

    // send this back to the requester so they know what happened
    res.send('Recieved: Adding User');

    // TODO make matches for this user - not for places
    if(req.body['type_of_user'] == 'users'){
        make_matches_for_user(req.body['email'],db);
    }
    // db.run('DELETE FROM users WHERE email="EMAIL";'.replace('EMAIL',req.body['email']))
};

exports.update_user = function (req, res, db) {
    console.log('Updating User');

    // format the query
    let query = "UPDATE users SET name='NAME',email='EMAIL',password='PASSWORD',interests='INTERESTS',location='LOCATION',picture_path='PICTURE',bio='BIO' WHERE userid=ID"
    query = query.replace('NAME', clean_for_sql(req.body['name']));
    query = query.replace('EMAIL', clean_for_sql(req.body['email']));
    query = query.replace('PASSWORD', clean_for_sql(req.body['password']));
    query = query.replace('INTERESTS', clean_for_sql(req.body['interests']));
    query = query.replace('LOCATION', clean_for_sql(req.body['location']));
    query = query.replace('PICTURE', clean_for_sql(req.body['picture_path']));
    query = query.replace('BIO', clean_for_sql(req.body['bio']));
    query = query.replace('ID', req.body['userid']);
    // run the query
    db.run(query);

    // send this back to the requester so they know what happened
    res.send('Recieved: Updating User');
};

exports.get_user = function (req, res, db) {
    console.log('Getting User id:' + req.params['userid']);
    let query = "SELECT * FROM users WHERE userid=" + req.params['userid'];
    let results = "";
    db.all(query, function (err, table) {
        if (err) {
            console.error(err.message);
        }
        results = table;
        console.log(table);
        res.send(JSON.stringify(table));
    });
    console.log(results)
};


exports.get_user_matches = function (req, res, db) {
    console.log(req.body['userid']);
    let statement = "SELECT * FROM matches WHERE (people LIKE 'ID,%') OR (people LIKE '%,ID,%') OR (people LIKE '%,ID')"
    let sql_statement = statement.replace(/ID/g, req.body['userid']);

    db.all(sql_statement, function (err, activity_table) {
        var people = [];
        for (let i in activity_table) {
            people = people.concat(activity_table[i]['people'].split(','))
        }
        for (let i in activity_table) {
            people = people.concat(activity_table[i]['place'])
        }
        people = [...new Set(people)];
        // now select all the people that are related to this activity
        console.log(people.toString());
        var users_statement = "SELECT userid,name,picture_path,type_of_user FROM users WHERE userid IN (PEOPLE)"
        users_statement = users_statement.replace('PEOPLE', people.toString());
        db.all(users_statement, function (err, users_table) {
            console.log(users_table);
            res.send({'matches': activity_table, 'users': users_table})
        })

    })
}

exports.get_match = function (req, res, db) {
    var id = req.params['match_id']
    var statement = "SELECT * FROM matches WHERE match_id=ID"
    var sql_statement = statement.replace(/ID/g, id)
    db.all(sql_statement, function (err, activity_table) {
        console.log(activity_table)
        var people = []
        for (var i in activity_table) {
            people = people.concat(activity_table[i]['people'].split(','))
        }
        for (var i in activity_table) {
            people = people.concat(activity_table[i]['place'])
        }
        people = [...new Set(people)]
        // now select all the people that are related to this activity
        console.log(people.toString())
        var users_statement = "SELECT userid,name,picture_path,type_of_user,email FROM users WHERE userid IN (PEOPLE)"
        users_statement = users_statement.replace('PEOPLE', people.toString())
        db.all(users_statement, function (err, users_table) {
            console.log(users_table)
            res.send({'matches': activity_table, 'users': users_table})
        })

    })
};

exports.update_user_matches = function (req, res, db) {
    console.log(req.body['userid'])
    // get the status is the users in the match
    var statement = "SELECT status FROM matches WHERE match_id=ID"
    statement = statement.replace('ID', req.body['match_id'])
    db.all(statement, function (err, table) {
        var status = JSON.parse(table[0]['status'])
        console.log(status)
        status[req.body['userid'].toString()] = req.body['status']
        status = JSON.stringify(status)
        statement = "UPDATE matches SET status='STATUS' WHERE match_id=ID"
        statement = statement.replace('STATUS', status)
        statement = statement.replace('ID', req.body['match_id'])
        console.log(statement)
        db.run(statement, function () {
            res.send('Updated')
        })
    })
};

/*
Delete all previous tokens for a given user
*/
function clean_auth_table_for_user(db, id) {
    let query = "DELETE FROM authorization WHERE userid=" + id + ""
    console.log(query)
    db.run(query)
}

exports.login = function (req, res, db) {
    console.log(req.body)
    console.log("============")
    // get the user with the email
    // compare passwords
    let query = "SELECT * FROM users WHERE email='" + req.body['email'] + "'"
    let results = ""
    console.log(query)
    db.all(query, function (err, table) {
        console.log(table)
        if (table[0]['password'] === req.body['password']) {
            // make an authorization toke of 16 random digits and characters
            let auth_token = makeid(16)
            var time = Date.now()
            // delete all old auth tokens belonging to the user
            clean_auth_table_for_user(db, table[0]['userid'])
            // add the key to the table
            let query2 = "INSERT INTO authorization (token, userid, time_issued) VALUES ('" +
                auth_token + "'," + table[0]['userid'] + ",'" + time + "')"
            console.log(query2)
            db.all(query2, function (err, table) {
            })
            // send the key back to the front end
            var json = JSON.stringify({auth: auth_token, id: table[0]['userid']})
            res.send(json)
        } else {
            res.send(401, 'Email or password incorrect')
        }
    });
};
