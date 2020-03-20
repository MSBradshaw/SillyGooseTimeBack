'use strict';

const sqlite3 = require('sqlite3').verbose();
let verbose = true;

// open a connection
let db = new sqlite3.Database('./db/sillygoose.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sillygoose database.');
});

// try doing something with the connection
db.serialize(function() {
    console.log('Running in other file')
    // THIS IS ONLY for REMEMBER TO F%$^&ING DELETE IT!!
    // db.run("DROP TABLE IF EXISTS users");
    // db.run("DROP TABLE IF EXISTS places");
    // db.run("DROP TABLE IF EXISTS matches");
    // db.run("DROP TABLE IF EXISTS authorization");

    db.run(
        "CREATE TABLE IF NOT EXISTS users ("+
        "userid INTEGER PRIMARY KEY AUTOINCREMENT,"+
        "name TEXT NOT NULL,"+
        "email TEXT NOT NULL,"+
        "password TEXT NOT NULL,"+
        "interests TEXT NOT NULL,"+
        "location TEXT NOT NULL,"+
        "picture_path TEXT NOT NULL,"+
        "bio TEXT NOT NULL"+
        ");"
    );

    // db.run(
    //     "INSERT INTO users (name,email,password,interests,location,picture_path,bio) "+
    //     "VALUES ('Michael B','mike@gmail.com','temp','hiking, skiing, crossfit','Boulder, CO','IMAGE-1584583984792.jpg','Looking to have a silly goose time')"
    // )
    if(verbose){
        db.all('SELECT * FROM users', function(err, table) {
            console.log(table);
        });
    }

    // create the places table
    db.run(
        "CREATE TABLE IF NOT EXISTS places ("+
        "place_id INTEGER PRIMARY KEY AUTOINCREMENT, "+
        "name TEXT NOT NULL,"+
        "activities TEXT NOT NULL,"+
        "location TEXT NOT NULL"+
        ");"
    );
    // Add something to the db
    // db.run(
    //     "INSERT INTO places (name,activities,location)"+
    //     "VALUES ('CF Left Hand','Crossfit','Walnut St.')"
    // )


    if(verbose){
        db.all('SELECT * FROM places', function(err, table) {
            console.log(table);
        });
    }
    // create the matches table
    db.run(
        "CREATE TABLE IF NOT EXISTS matches ("+
        "match_id INTEGER PRIMARY KEY AUTOINCREMENT, "+
        "people TEXT NOT NULL,"+
        "place TEXT NOT NULL,"+
        "activity TEXT NOT NULL"+
        ");"
    )
    //db.run("INSERT INTO matches (people,place,activity) VALUES ('0,1','0','Crossfit')")
    if(verbose){
        db.all('SELECT * FROM matches', function(err, table) {
            console.log(table);
        });
    }

    // create the authorization Table
    db.run(
            "CREATE TABLE IF NOT EXISTS authorization ("+
            "auth_id INTEGER PRIMARY KEY AUTOINCREMENT, "+
            "token TEXT NOT NULL,"+
            "userid INTEGER NOT NULL,"+
            "time_issued INTEGER NOT NULL"+
            ");"
        )
    if(verbose){
        db.all('SELECT * FROM authorization', function(err, table) {
            console.log(table);
        });
    }
});

exports.db = db;
