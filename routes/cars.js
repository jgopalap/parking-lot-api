var app = require('../server').app;
var upload = require('../server').upload;
var CarModel = require('../models/car').CarModel;
var ParkingSpotModel = require('../models/parking-lot').ParkingSpotModel;

/**
	GET car by given license plate number.
	@param: license plate number (primary key) of car
	@return: a car as JSON on success
 */
app.get('/cars/:licensePlate', function(req, res){
	CarModel.findById(req.params.licensePlate, function(err, car) {
		if(err) {
			console.log(err);
		} else {
			res.json(car);
		}	
	});
});

/*
	POST/add a car (linking the the car to the given parking spot, if necessary).
	@param: a JSON in the body that contains the license plate number (primary, required),
	             valet user id (required), car model (not required), timeIn (required),
	             colour (not required), and parking spot id(not required)
	@return: Status code 201 and created car JSON on success, otherwise status code 422 if 
	 	     car is already parked in the given parking spot.  
 */
app.post('/cars/add', upload.array(), function(req, res){
	var carItem = {
		userId: req.body.userId,
		model: req.body.model,
		size: req.body.size,
		timeIn: req.body.timeIn,
		timeOut: req.body.timeOut,
		colour: req.body.colour,
		_id: req.body.licensePlate,
		parkingSpotId: req.body.parkingSpotId
	};
	
	ParkingSpotModel.findById(carItem.parkingSpotId, function(err, parkingSpot) {
		//check if the parking spot size is compatible
		if(parkingSpot.size !== carItem.size) {
			res.sendStatus(422);
		}

		//check if anothr car is already parked there
		if(parkingSpot.car) {
			res.sendStatus(422);
		} else {
			parkingSpot.car = carItem._id;
			parkingSpot.save(function(err) {
				console.log(err);
			});
		}
	});

	var car = new CarModel(carItem);
	car.save(function(err, car){
		if(err) {
			console.log(err);
		} else {
			res.status(201).json(car);
		}
	});
});

/**
	PUT/update a car.
	@param: license plate number of the car to update
	@param: body will contain the content to update
	@return: status code 200 and the updated car JSON on success
 */
app.put('/cars/:licensePlate/update', upload.array(), function(req, res){
	CarModel.findByIdAndUpdate(req.params.licensePlate, function(err, car) {
		if(req.body.model) {
  			car.model = req.body.model;
  		}
  		if(req.body.timeIn) {
  			car.timeIn = req.body.timeIn;
  		}
  		if(req.body.timeOut) {
  			car.timeOut = req.body.timeOut;
  		}
  		if(req.body.colour) {
  			car.colour = req.body.colour;
  		}
  		if(req.body.parkingSpot) {
  			car.parkingSpot = req.body.parkingSpot;
  		}
  		if(req.body.parkingSpotId) {
  			car.parkingSpotId = req.body.parkingSpotId;
  		}
  		car.save(function(err, car) {
  			if(err) {
  				console.log(err);
  			} else {
  				res.status(200).json(car);
  			}
  		});
  	});

});

/**
	PUT/update the car upon exit.  Upon completion the car will be removed from the parking lot and its 
	timeIn, timeOut, and cost fields set to undefined.  The car will also be removed from the parking spot
	collection.
*/
app.put('/cars/:id/exit', function(req, res) {
	CarModel.findById(req.params.id, function(err, car) {

	})
});

/**
	DELETE the given car.
	@param: license plate number of the car to delete.
	@return: status code 204 on success
 */
app.delete('/cars/:licensePlate/delete', function(req, res){
	CarModel.findByIdAndRemove(req.params.licensePlate, function(err, car) {
		if(err) {
			console.log(err);
		} else {
			res.sendStatus(204);
		}
	});
});
