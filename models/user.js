var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var user = new Schema({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true
	},
	token: {
		type: String,
		required: true,
		unique: true
	}
});

var UserModel = mongoose.model('user', user);
exports.UserModel = UserModel;