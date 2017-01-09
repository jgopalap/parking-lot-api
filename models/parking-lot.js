var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var carSchema = require('../models/car').carSchema;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var parkingRecord = new Schema ({
	username: {
		type: String,
		ref: 'user',
		required: true
	},
	car: carSchema,
	timeIn: {
		type: Date,
		required: true
	},
	timeOut: {
		type: Date
	},
	cost: {
		type: Number
	},
	currency: {
		type: String,
		default: 'CAD'
	}
});

//TODO: implement validator for ensuring uniqueness of location member, this
//necessary because subdocuments don't validate against the unique poperty
var parkingSpot = new Schema ({
	size: {
		type: String,
		required: true,
		enum: ['S', 'M', 'L', 'XL']
	},
	location: {
		type: String,
		required: true,
	},
	car: carSchema, 
	parkingRecords: [parkingRecord]
});

var parkingRate = new Schema ({
	halfHourRate: {
		type: Number,
		required: true,
		default: 3
	},
	dailyMaxRate: {
		type: Number,
		required: true,
		default: 15
	},
	currency: {
		type: String,
		required: true,
		default: 'CAD'
	}
});

//TODO: address information needs to be properly stored and consistent
//i.e. all postal codes should either have no spaces
var parkingLot = new Schema({
	ownerUsername: {
		type: String,
		ref: 'user',
		required: true
	},
	name: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	city: {
		type: String
	},
	postalCode: {
		type: String,
		required: true
	},
	rate: {
		type: parkingRate,
		required: true,
		default : parkingRate
	},
	capacity: {
		type: Number,
		required: true
	},
	parkingSpots: [
		parkingSpot
	]
});

parkingLot.index({ postalCode: 1, address: 1 }, {unique: true}); //compound index, with postalCode being the primary for sort order

/**
	Create a default parking lot layout.
	@param: parking lot object
	@param: parking lot specification object, contains the size, level and distribution
	@param: capacity total number of parking spaces
 */
var createParkingLotLayout = function createParkingLotLayout(parkingLot, specification, capacity) {
	var numSizes = Object.keys(specification).length;
	var locationPrefix;
	var numParkingSpots;
	var size;
	var remainingParkingSpots = capacity;
	var subtotal = 0;
	var j = 1;
	for(var property in specification) {
		if (specification.hasOwnProperty(property)) {
			locationPrefix = 'P' + specification[property][1] + '-';
			size = specification[property][0];
			numParkingSpots = Math.round(capacity * specification[property][2]);
			subtotal += numParkingSpots;
			if(j === numSizes) {
				subtotal -=numParkingSpots;
				numParkingSpots = capacity - subtotal;
			}
			for(var i=0; i<numParkingSpots; i++) {
				var p = {
					size: size,
					location: locationPrefix + i
				}
				parkingLot.parkingSpots.push(p);
			}
		    j++;
		}		
	}
};

/**
	Compute the cost of the parking session.
	@param: the time the car entered the parking lot.
	@param: the time the car exited the parking lot.
	@param: the half hour rate.
	@param: the daily/overnight max rate.
 */
var computeCost = function computeCost(timeIn, timeOut, rate, maxRate) {
	var numDays = 0;
	var numHours = 0;
	var numMinutes = 0;
	var cost = 0;
	var subCost = 0;
	if(timeIn.getMonth() === timeOut.getMonth() && timeIn.getDate() === timeOut.getDate() && timeOut.getHours() === timeOut.getHours()) {
		numMinutes = timeOut.getMinutes() - timeIn.getMinutes();
		cost = rate * ((Math.abs(numMinutes-1) / 30) + 1);
	} else if (timeIn.getMonth() === timeOut.getMonth() && timeIn.getDate() === timeOut.getDate()) {
		//compute cost for minutes (to the next hour for time in)
		numMinutes = 60 - timeIn.getMinutes();
		numMinutes += timeOut.getMinutes();
		cost = rate * ((Math.abs(numMinutes-1) / 30) + 1);
		//compute cost for full hours expired 
		numHours =  timeOut.getHours() - (timeIn.getHours() + 1);
		cost += (numHours * 2) * rate;
		if(cost > maxRate) {
			cost = maxRate;
		}
	} else if (timeIn.getMonth() === timeOut.getMonth()) {
		//compute the cost of full days that expired
		numDays = timeOut.getDate() - timeIn.getDate();
		cost += (numDays - 1) * maxRate;
		//compute cost of hours elapsed for time in until eod
		numHours = 24 - (timeIn.getHours() + 1);
		subCost = numHours*2*rate;
		if(subCost > maxRate) {
			cost += maxRate;
		} else {
			//compute cost of minutes elapsed for time in 
			numMinutes = 60 - timeIn.getMinutes();
			subCost += rate * ((Math.abs(numMinutes-1) / 30) + 1);
			if(subCost > maxRate) {
				cost+= maxRate;	
			} else {
				cost += subCost;
			}
		}

		//compute cost of hours elapsed for time out from beggining of day
		subCost = timeOut.getHours() * rate * 2;
		if(subCost > maxRate) {
			cost += maxRate;
		} else {
			subCost += rate * (Math.abs(timeOut.getMinutes()-1)/30 + 1);
			if(subCost > maxRate) {
				cost += maxRate;
			} else {
				cost += subCost;
			}
		}
	}

	return cost;
}

var ParkingLotModel = mongoose.model('parkingLot', parkingLot);

exports.ParkingLotModel = ParkingLotModel;
exports.createParkingLotLayout = createParkingLotLayout;
exports.computeCost = computeCost;