var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var car = new Schema({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	size: {
		type: String,
		required: true,
		enum: ['S', 'M', 'L', 'XL']
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
	parkingSpotId: {
		type: Schema.Types.ObjectId,
		ref: 'parkingSpot',
		required: true
	},
	cost: {
		type: Number,
		required: false
	}
});

var CarModel = mongoose.model('car', car);
exports.CarModel = CarModel;