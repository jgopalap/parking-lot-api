var app = require('../server').app;
var upload = require('../server').upload;
var UserModel = require('../models/user').UserModel;


/**
	POST/create a user account for valets and owners.
	@param: body will contain the conent of user to create
	@return the status code 201 and JSON of the new user (embedding generated token) on success
 */
app.post('/users/add', upload.array(), function(req, res){
	var userItem = {
		_id: req.body.username,
		password: req.body.password,
		name: req.body.name,
		role: req.body.role
	};
	var user = new UserModel(userItem);
	user.save(function(err, user) {
		//TODO: generate a token and embed in response
		if(err) {
			console.log(err); 
		} else {
			res.status(201).json(user);
		}
	});
});

/**
	PUT/update the given user.
	@param: username of user
	@return: status code 200 and user JSON on success
 */
app.put('/users/:username/update', upload.array(), function(req, res){
	UserModel.findById(req.params.username, function(err, user) {
		if(req.body.name) {
  			user.name = req.body.name;
  		}
  		if(req.body.role) {
  			user.role = req.body.role;
  		}
  		if(req.body.password) {
  			user.password = req.body.password;
  		}
  		user.save(function(err, user) {
  			if(err) {
  				console.log(err);
  			} else {
  				res.status(200).json(user);
  			}
  		});
  	});

});


/**
	DELETE the given user.
	@param: username of the user to delete
	@return: status code 204 on success
 */
app.delete('/users/:username/delete', function(req, res){
	UserModel.findByIdAndRemove(req.params.username, function(err, user) {
		if(err) {
			console.log(err);
		} else {
			res.sendStatus(204);
		}
	});	
});