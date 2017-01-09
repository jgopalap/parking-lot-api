var app = require('../server').app;
var upload = require('../server').upload;
var ParkingLotModel = require('../models/parking-lot').ParkingLotModel;

/**
	GET car by given license plate number.
	@param: license plate number (primary key) of car
	@return: a car as JSON on success or 
 */
app.get('/cars/:licensePlate', function(req, res) {
	var regex = req.params.licensePlate.replace(' ', '');
	ParkingLotModel.findOne({parkingSpots : {parkingRecords : {car: {$elemMatch: {$regex: regex, $options: 'i'}}}}}, function(err, parkingLot) {
		if(err) {
			console.log(err);
		} else {
			res.json(parkingLot.parkingSpots[0].parkingRecords[0].car);
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
	var regex = req.params.licensePlate.replace(' ', '');
	ParkingLotModel.find({parkingSpots : {parkingRecords : {car: {$elemMatch: {$regex: regex, $options: 'i'}}}}}, function(err, parkingLot) {
		if(req.body.size) {

		}
		if(req.body.model) {
  			
  		}
  		if(req.body.colour) {

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