var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var car = new Schema({
	_id: {
		type: String,
		required: true
	},
	valet: {
		type: Number,
		ref: 'users',
		required: false
	},
	model: {
		type: String,
		required: false
	},
	timeIn: {
		type: Date,
		required: true
	},
	timeOut: {
		type: Date,
		required: false
	},
	colour: {
		type: String,
		required: false
	},
	location: {
		type: String,
		ref: 'parkingSpots',
		required: false
	}
});

var CarModel = mongoose.model('car', car);
exports.CarModel = CarModel;