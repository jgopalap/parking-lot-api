var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carSchema = new Schema({
	_id: String, //plate number  
	size: {
		type: String,
		required: true,
		enum: ['S', 'M', 'L', 'XL']
	},
	model: String,
	colour: String
});

//TODO: add a owner schema
	
exports.carSchema = carSchema;