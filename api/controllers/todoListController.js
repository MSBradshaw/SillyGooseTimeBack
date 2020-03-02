'use strict';


// var mongoose = require('mongoose'),
//   Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req, res) {
	console.log('List All Tasks')
	console.log(req.body)
	res.send('Recieved')
};




exports.create_a_task = function(req, res) {
	console.log('Create a Tasks')
	console.log(req.body)
	res.send('Recieved')
};


exports.read_a_task = function(req, res) {
	console.log('Read a Tasks')
	console.log(req.body)
	res.send('Recieved')
};


exports.update_a_task = function(req, res) {
	console.log('Update a Tasks')
	console.log(req.body)
	res.send('Recieved')
};


exports.delete_a_task = function(req, res) {
	console.log('Delete a Tasks')
	console.log(req.body)
	res.send('Recieved')
};
