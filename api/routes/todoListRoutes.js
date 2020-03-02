'use strict';
module.exports = function(app) {
	var todoList = require('../controllers/todoListController');

	// This line comes from https://enable-cors.org/server_expressjs.html
	// it is for enabling Cross Origin Resource Sharing
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // update to match the domain you will make the request from
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});

 	// todoList Routes
	app.route('/tasks')
	.get(todoList.list_all_tasks)
	.post(todoList.create_a_task);


	app.route('/tasks/:taskId')
	.get(todoList.read_a_task)
	.put(todoList.update_a_task)
	.delete(todoList.delete_a_task);

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
};
