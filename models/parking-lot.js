var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var parkingSpot = new Schema ({
	size: {
		type: String,
		required: true
	},
	location: {
		type: String,
		required: true
	},
	car: {
		type: String,
		ref: 'car',
		required: true
	}
});

var parkingLot = new Schema({
	name: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: false
	},
	postalCode: {
		type: String,
		required: true
	},
	capacity: {
		type: Number,
		required: true
	},
	parkingSpots: {
		type: [parkingSpot],
		required: true
	}
});

var ParkingLotModel = mongoose.model('parkingLot', parkingLot);
var ParkingSpotModel = mongoose.model('parkingSpot', parkingSpot);

exports.ParkingLotModel = ParkingLotModel;
exports.ParkingSpotModel = ParkingSpotModel; 
