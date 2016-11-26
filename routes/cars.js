var app = require('../server').app;
var upload = require('../server').upload;
var CarModel = require('../models/car').CarModel;


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
	POST/add a car.
	@param: a JSON in the body that contains the license plate number (primary, required),
	             valet user id (required), car model (not required), timeIn (required),
	             colour (not required), and location(not required)
	@return: Status code 201 and created car JSON on success.  
 */
app.post('/cars/add', upload.array(), function(req, res){
	var carItem = {
		userId: req.body.userId,
		model: req.body.model,
		timeIn: req.body.timeIn,
		timeOut: req.body.timeOut,
		colour: req.body.colour,
		_id: req.body.licensePlate,
		location: req.body.parkingSpot
	};
	
	var car = new CarModel(carItem);
	car.save(function(err, car){
		if(err) {
			console.log(err);
		} else {
			res.send(201).json(car);
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
  		car.model = req.body.model;
  		car.timeIn = req.body.timeIn;
  		car.timeOut = req.body.timeOut;
  		car.colour = req.body.colour;
  		car.parkingSpot = req.body.parkingSpot;
  		car.location = req.body.location;
  		car.save(function(err, car) {
  			if(err) {
  				console.log(err);
  			} else {
  				res.send(200).json(car);
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
