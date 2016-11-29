var app = require('../server').app;
var upload = require('../server').upload;
var UserModel = require('../models/user').UserModel;


/**
	POST/create a user account for valets, owners and parking authorities.
	@param: body will contain the conent of user to create
	@return the status code 201 and JSON of the new user (embedding generated token) on success
 */
app.post('/users/add', upload.array(), function(req, res){
	var userItem = {
		name: req.body.name,
		role: req.body.role,
		token: req.body.token,
	};
	var user = new UserModel(userItem);
	user.save(function(err, user) {
		if(err) {
			console.log(err);
		} else {
			res.status(201).json(user);
		}
	});
});

/**
	PUT/update the given user.
	@param: 24 hex id of user
	@return: status code 200 and user JSON on success
 */
app.put('/users/:id/update', upload.array(), function(req, res){
	UserModel.findById(req.params.id, function(err, user) {
		if(req.body.name) {
  			user.name = req.body.name;
  		}
  		if(req.body.role) {
  			user.role = req.body.role;
  		}
  		if(req.body.token) {
  			user.token = req.body.token;
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
	@param: 24 hex id of the user to delete
	@return: status code 204 on success
 */
app.delete('/users/:id/delete', function(req, res){
	UserModel.findByIdAndRemove(req.params.id, function(err, user) {
		if(err) {
			console.log(err);
		} else {
			res.sendStatus(204);
		}
	});	
});