var app = require('../server').app;
var upload = require('../server').upload;
var UserModel = require('../models/user').UserModel;


app.post('/users/add', upload.array(), function(req, res){
	var userItem = {
		name: req.body.name,
		type: req.body.type,
		token: req.body.token,
		_id: req.body.id
	};
	var user = new UserModel(userItem);
	user.save(function(err, user) {
		console.log(err);
		if(!err) {
			res.sendStatus(200);
		}
	});
});

app.put('/users/update', upload.array(), function(req, res){
	UserModel.find({id: req.body.id}, function(err, user) {
  		user.name = req.body.name;
  		user.type = req.body.type;
  		user.token = req.body.token;
  		user.save(function(err, user) {
  			if(!err) {
  				res.sendStatus(200);
  			}
  		});
  	});

});

app.delete('/users/delete', upload.array(), function(req, res){
	UserModel.findByIdAndRemove(req.body.id, function(err, user) {
		if(!err) {
			res.sendStatus(200);
		}
	});	
});