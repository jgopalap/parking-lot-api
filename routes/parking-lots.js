var app = require('../server').app;
var upload = require('../server').upload;
var ParkingLotModel = require('../models/parking-lot').ParkingLotModel;

var createParkingLotLayout = require('../models/parking-lot').createParkingLotLayout;
var computeCost = require('../models/parking-lot').computeCost;

/**
	GET a parking lot by postal code and address.
	@param: street number of the parking lot
	@param: street name of the parking lot
	@param: postal code of the parking lot
	@return parking lot JSON
 */
app.get('/parkingLots/:streetNumber/:streetName/:postalCode', function(req, res) {
	var regex1 = req.params.streetNumber + '\\s*' + req.params.streetName + '\\s*.*';
	var regex2 = req.params.postalCode.replace(' ', '');
	ParkingLotModel.find({$and: [{address: {$regex: regex1, $options: 'i'}}, {postalCode: {$regex: regex2, $options: 'i'}}]}, function(err, parkingLot) {
		if(err) {
			console.log(err);
		} else {
			res.json(parkingLot);
		}
	});
});

/**
	GET all cars parked in the given parking lot.  
	@param: 24 hex id of parking lot (primary key)
	@return: an array of car JSON on success
 */
app.get('/parkingLots/:id/cars', function(req, res){
	ParkingLotModel.find({_id: req.params.id}, 'parkingLot.parkingSpots.car', function(err, cars) {
		if(err) {
			console.log(err);
		} else {
			res.json(cars);
		}	
	});
});

/*
	POST/ Park a car in a parking spot.  The car data will be added if it doesn't already exist, however the necessary data 
	for the car should be obtained through GET /car/:licensePlate and sent as part of the request to avoid introducing data inconsistency.
	Unless of course the license plate is now associated with a different car.
	@param: the parking lot id
	@param: the parking spot location
	@param: a JSON in the body that contains the license plate number (primary, required),
	             valet username (required), car model (not required), timeIn (required in the format YYYY-mm-ddTHH:MM:ssZ),
	             colour (not required), and parkingSpotId (required)
	@return: Status code 201 and created car JSON on success, otherwise status code 400 if 
	 	     car is already parked in the given parking spot or size isn't compatible.  
 */
app.post('/parkingLots/:id/parkingSpots/:location/car/enter', upload.array(), function(req, res){
	var carItem = {
		size: req.body.size,
		_id: req.body.licensePlate,
	};
	
	if(req.body.model) {
		carItem.model = req.body.model;
	}
	if(req.body.colour) {
		carItem.colour = req.body.colour;
	}

	var date = new Date(req.param.date);

	var parkingRecord = {
		username: req.body.username,
		car: carItem,
		timeIn: req.body.timeIn
	}

	ParkingLotModel.findOne({"_id": req.params.id},{parkingSpots: {$elemMatch: {location: req.params.location}}}, 'parkingSpots parkingSpots.parkingRecords', function(err, parkingLot) {
		//a car is already parked in that parking spot
		if(parkingLot.parkingSpots[0].hasOwnProperty('car')) {
			res.sendStatus(400);
		}

		//check if the parking spot size is compatible
		if(parkingLot.parkingSpots[0].size !== carItem.size) {
			res.sendStatus(400);
		}

		parkingLot.parkingSpots[0].car = carItem;
		parkingLot.save(function(err) {
			console.log(err);
		});

		ParkingLotModel.update({ _id: req.params.id, 'parkingSpots.location': req.params.location }, { $push:  { 'parkingSpots.$.parkingRecords': parkingRecord } }, function(err) {
			res.status(201).json(parkingRecord);
		});
	});
});


/**
	PUT/update the parking data upon car exit.  A history will be retained on the parking session.
	@param: the parking lot that the car is exiting from.
	@param: the parking record object
*/
app.put('/parkingLots/:id/car/:licensePlate/exit', upload.array(), function(req, res) {
	var regex = req.params.licensePlate.replace(' ', '');
	//ParkingLotModel.update({_id: req.params.id, 'parkingSpots.car._id': {$regex: regex, $options: 'i'}}, {$unset: {'parkingSpots.car': '' }}, function(err){console.log(err)});
	ParkingLotModel.findOne({_id: req.params.id, 'parkingSpots.car._id': {$regex: regex, $options: 'i'}, 'parkingSpots.parkingRecords.timeOut': {$exists: false}}, {'parkingSpots.parkingRecords.$':1, 'rate': 1}, function(err, parkingLot) {
		if(err) {
			res.sendStatus(400);
			return;
		}

		parkingLot.parkingSpots[0].car = undefined;
		var parkingRecord = parkingLot.parkingSpots[0].parkingRecords[0];
		parkingRecord.timeOut = new Date(req.body.timeOut);
		parkingRecord.cost = computeCost(parkingRecord.timeIn, parkingRecord.timeOut, parkingLot.rate.halfHourRate, parkingLot.rate.dailyMaxRate);	
		parkingLot.save(function(err) {
			res.status(201).json(parkingRecord);
		});
	});
});


/**
	GET all available parking spots, filter by parking lot or parking spot size embedded in the query as ?id=<id> or ?size=<size>.
	@param: 24 hex id of the parking lot
	@return: array of available parking spot JSONs
*/
app.get('/parkingLots/parkingSpots/available', function(req, res) {
	if(req.query.id) {
		ParkingLotModel.find({_id: req.params.id, 'parkingSpots.car': {$exists: false}}, 'parkingSpots', function(err, parkingSpots) {
			if(err) {
				console.log(err);
			} else {
				res.json(parkingSpots);
			}
		});
	} else if (req.query) {

	}
})

/**
	POST/add a parking lot with the default layout of 10% small, 45% medium, 35% large and 10% xlarge
	if parking spots is empty.
	@param: the content of the parking lot in the body
	@return: status code 201 and parking lot JSON on success
 */
app.post('/parkingLots/add', upload.array(), function(req, res){
	var parkingLotItem = {
		ownerUsername: req.body.ownerUsername,
		name: req.body.name,
		address: req.body.address,
		postalCode: req.body.postalCode,
		capacity: req.body.capacity,
		parkingSpots:[]
	};

	if(req.body.halfHourRate) {
		parkingLotItem.rate.halfHourRate = req.body.halfHourRate;
	}
	if(req.body.dailyMaxRate) {
		parkingLotItem.rate.dailyMaxRate = req.body.dailyMaxRate;
	}
	if(req.body.currency) {
		parkingLotItem.rate.currency = req.body.currency;
	}
	if (req.body.parkingSpots) {
		parkingLotItem.parkingSpots = req.body.parkingSpots;
	} else {
		var parkingLotSpecification = {
			small: ['S', 4, 0.1],
			medium: ['M', 3, 0.45],
			large: ['L', 2, 0.35],
			xlarge: ['XL', 1, 0.1]
		}
		createParkingLotLayout(parkingLotItem, parkingLotSpecification, parkingLotItem.capacity);
	}

	var parkingLot = new ParkingLotModel(parkingLotItem);

	parkingLot.save(function(err, parkingLot) {
		if(err) {
			console.log(err);
		} else {
			res.status(201).json(parkingLot); 
		}
	});
});

/**
	POST/add a parking spot in given parkingLot
	@param: 24 hex id of the parking lot
	@param: parking spot content in the body
	@return: the parking spot JSON 
 */
app.post('/parkingLots/:id/parkingSpots/add', upload.array(), function(req, res){
	var parkingSpotItem = {
		size: req.body.size,
		location: req.body.location
	};
	
	ParkingLotModel.findById(req.params.id, function(err, parkingLot){
		if(err) {
			console.log(err); 
		} else {
			parkingLot.parkingSpots.push(parkingSpotItem);
			//increment the capacity in case it was previously maxed
			if (parkingLot.capacity === parkingLot.children.length) {
				parkingLot.capacity = parkingLot.capacity + 1;
			}
			parkingLot.save(function(err, parkingLot) {
				if(err) {
					console.log(err);
				} else {
					res.status(201).json(parkingLot);
				}
			});
		}
	});

});

/**
	PUT/update the parking lot.
	@param: 24 hex id of the parking lot
	@param: the content of the parking lot to update in the body
	@return: status code 200 and updated parking lot JSON on success
 */
app.put('/parkingLots/:id/update', upload.array(), function(req, res){
	ParkingLotModel.findById(req.params.id, function(err, parkingLot) {
		if(req.body.name) {
  			parkingLot.name = req.body.name;
  		}
  		if(req.body.address) {
  			parkingLot.address = req.body.address;
  		}
  		if(req.body.city) {
  			parkingLot.city = req.body.city;
  		}
  		if(req.body.postalCode) {
  			parkingLot.postalCode = req.body.postalCode;
  		}
  		if(req.body.capacity) {
  			parkingLot.capacity = req.body.capacity;
  		}
  		if(req.body.parkingSpots) {
  			parkingLot.parkingSpots = req.body.parkingSpots;
  		}
  		parkingLot.save(function(err, parkingLot) {
  			if(err) {
  				console.log(err);
  			} else {
  				res.status(200).json(parkingLot);
  			}
  		});
  	});

});

/**
	PUT/update the parking spot.
	@param: 24 hex id of the parking spot.
	@param: parking spot content in the body
	@return: parking spot JSON
*/
app.put('/parkingLots/:id/parkingSpots/:location/update', upload.array(), function(req, res) {
	ParkingLotModel.findOne({"_id": req.params.id},{parkingSpots: {$elemMatch: {location: req.params.location}}}, function(err, parkingLot) {
		if (err) {
			console.log(err);
		} else {	
			if(req.body.size) {
				parkingLot.parkingSpots[0].size = req.body.size;
			}
			if(req.body.location) {
				parkingLot.parkingSpots[0].location = req.body.location;
			}
			parkingLot.save(function(err, parkingLot) {
				if(err) {
					console.log(err);
				} else {
					res.status(200).json(parkingLot);
				}
			});
		}
  	});
});

/**
	DELETE the parking lot
	@param: 24 hex id of the parking lot
	@return: status code 204 on success
 */
app.delete('/parkingLots/:id/delete', function(req, res){
	ParkingLotModel.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err);
		} else {
			res.sendStatus(204);
		}
	});
});

/**
	DELETE the parking spot
	@param: 24 hex id for parking lot
	@param: parking spot location or identifier
	@return: status code 204 on success
*/
app.delete('/parkingLots/:id/parkingSpots/:location/delete', function(req, res) {
	ParkingLotModel.findOneAndRemove({"_id": req.params.id},{parkingSpots: {$elemMatch: {location: req.params.location}}}, function(err) {
		if(err) {
			console.log(err);
		} else {
			res.sendStatus(204);
		}
	});
});



