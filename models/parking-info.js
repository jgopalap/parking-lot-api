var mongoose = require('mongoose')
var Schema = mongoose.Schema;

/** 
    This class will mainly serve as the model for generating analytics and isn't hooked up yet.
 */
var parkingInfo = new Schema({
	carId: {
		type: Schema.Types.ObjectId,
		ref: 'car',
		required: true
	},
	timeIn: {
		type: Date,
		required: true
	},
	timeOut: Date,
	parkingSpot: {
		type: Schema.Types.ObjectId,
		ref: 'parkingSpot'
		required: true
	}
	cost: Number
});

var ParkingInfoModel = mongoose.model('parkingInfo', parkingInfo);
exports.ParkingInfoModel = ParkingInfoModel;