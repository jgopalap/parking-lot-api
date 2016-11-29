var app = require('../server').app;
var upload = require('../server').upload;
var ParkingLotModel = require('../models/parking-lot').ParkingLotModel;
var ParkingSpotModel = require('../models/parking-lot').ParkingSpotModel;

/**
	Create a defaulat parking lot layout.
	@param: parking lot object
	@param: parking spot size
	@param: capacity for given size
	@param: the prefix for the location reference
*/
function createParkingLotLayout(parkingLot, pSize, capacity, locationPrefix) {
	var i;
	for(var i=0; i<capacity; i++) {
		var p = {
			size: pSize,
			location: locationPrefix + i
		}
		var pRecord = new ParkingSpotModel(p);
		pRecord.save(function(err) {
			console.log(err);
		})
		parkingLot.parkingSpots.push(pRecord);
	}
};

/**
	GET a car parked in a given parking spot.
	@param: 24 hex id of parking spot 
	@return: a car JSON on success
 */
app.get('/parkingLots/parkingSpots/:id', function(req, res){
	ParkingLotModel.find({'parkingSpot._id': req.params.id}, 'parkingLot.parkingSpot.car', function(err, car) {
		if(err) {
			console.log(err);
		} else {
			res.json(car);
		}	
	});
});

/**
	GET the given parking lot.
	@param: 24 hex id of parking lot
	@return parking lot JSON
 */
app.get('/parkingLots/:id', function(req, res) {
	ParkingLotModel.findById(req.params.id, function(err, parkingLot) {
		if(err) {
			console.log(err);
		} else {
			res.json(parkingLot);
		}
	})
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
	var capacity = parseInt(req.body.capacity);
	var parkingLotItem = {
		name: req.body.name,
		address: req.body.address,
		city: req.body.city,
		postalCode: req.body.postalCode,
		capacity: req.body.capacity,
		parkingSpots: []
	};
	if (req.body.parkingSpots) {
		parkingLayout = req.body.parkingSpots;
	} else {
		var smallCapacity = capacity*0.1 | 0;
		var mediumCapacity = capacity*0.45 | 0;
		var largeCapacity = capacity*0.35 | 0;
		var superCapacity = capacity - smallCapacity - mediumCapacity - largeCapacity;
		
		createParkingLotLayout(parkingLotItem, 'S', smallCapacity, 'P4-');
		createParkingLotLayout(parkingLotItem, 'M', mediumCapacity, 'P3-');
		createParkingLotLayout(parkingLotItem, 'L', largeCapacity, 'P2-');
		createParkingLotLayout(parkingLotItem, 'XL', superCapacity, 'P1-');
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
		location: req.body.location,
		car: req.body.car
	};
	
	ParkingLotModel.findById(req.params.id, function(err, parkingLot){
		if(err) {
			console.log(err); 
		} else {
			var parkingSpot = new ParkingLotModel(parkingSpotItem);
			parkingSpot.save();
			parkingLot.parkingSpots.push(parkingSpotItem);
			parkingLot.save(function(err, parkingLot) {
				if(err) {
					console.log(err);
				} else {
					res.status(201).json(parkingSpotItem);
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
app.put('/parkingLots/parkingSpots/:id/update', upload.array(), function(req, res) {
	ParkingLotModel.findOne({'parkingSpot._id':req.params.id}, function(err, parkingLot) {
		ParkingLotModel.findOne({'parkingSpot._id':req.params.id}, 'parkingSpot', function(err1, parkingSpot) {
			if(req.body.size) {
				parkingSpot.size = req.body.size;
			}
			if(req.body.location) {
				parkingSpot.location = req.body.location;
			}
			if(req.body.car) {
				parkingSpot.car = req.body.car;
			}
			parkingLot.save(function(err) {
				if(err) {
					console.log(err);
				} else {
					res.status(200).json(parkingSpot);
				}
			});
		})
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
	@param: 24 hex id for parking spot
	@return: status code 204 on success
*/
app.delete('/parkingLots/parkingSpots/:id/delete', function(req, res) {
	ParkingLotModel.findOne({'parkingSpot._id':req.params.id}, function(err, parkingLot) {
		ParkingLotModel.findOne({'parkingSpot._id':req.params.id}, 'parkingSpot', function(err1, parkingSpot) {
			parkingSpot.remove(function(err, parkingSpot) {
				if(err) {
					console.log(err);
				} else {
					parkingLot.save(function(err) {
						if(err) {
							console.log(err);
						} else {
							res.sendStatus(204);
						}
					});
				}
			});

		});	
	});
});


