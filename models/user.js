var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var user = new Schema({
	_id: {
		type: String //username
	},
	password: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
		enum: ['admin', 'user']
	},
	token: {
		type: String,
//		required: true,  //TODO:reenable this once token based authentication is implemented
//		unique: true
	}
});

var UserModel = mongoose.model('user', user);
exports.UserModel = UserModel;