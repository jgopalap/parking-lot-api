var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var user = new Schema({
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
		enum: ['admin', 'valet', 'parking authority']
	},
	token: {
		type: String,
		required: true,
		unique: true
	}
});

var UserModel = mongoose.model('user', user);
exports.UserModel = UserModel;