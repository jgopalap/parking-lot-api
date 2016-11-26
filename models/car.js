var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var car = new Schema({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
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
		ref: 'parkingSpot',
		required: false
	},
	cost: {
		type: Number,
		required: false
	}
});

var CarModel = mongoose.model('car', car);
exports.CarModel = CarModel;