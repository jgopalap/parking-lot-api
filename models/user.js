var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var user = new Schema({
	_id: {
		type: Number,
		required: true
	},
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
		required: true
	}
});

var UserModel = mongoose.model('user', user);
exports.UserModel = UserModel;