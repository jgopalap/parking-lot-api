var app = require('../server').app;
var upload = require('../server').upload;
var CarModel = require('../models/car').CarModel;


app.get('/cars', function(req, res){
	CarModel.findById(req.query.licensePlate, function(err, car) {
		if(!err) {
			res.json(car);
		}	
	});
});

app.post('/cars/add', upload.array(), function(req, res){
	var carItem = {
		valet: req.body.valet,
		model: req.body.model,
		timeIn: req.body.timeIn,
		timeOut: req.body.timeOut,
		colour: req.body.colour,
		_id: req.body.licensePlate,
		location: req.body.parkingSpot
	};
	
	var car = new CarModel(carItem);
	car.save(function(err, car){
		if(!err) {
			res.sendStatus(200);
		}
	});
});

app.put('/cars/update', upload.array(), function(req, res){
	CarModel.findByIdAndUpdate(req.params.licensePlate, function(err, car) {
  		car.model = req.body.model;
  		car.timeIn = req.body.timeIn;
  		car.timeOut = req.body.timeOut;
  		car.colour = req.body.colour;
  		car.parkingSpot = req.body.parkingSpot;
  		car.location = req.body.location;
  		car.save(function(err, car) {
  			if(!err) {
  				res.sendStatus(200);
  			}
  		});
  	});

});

app.delete('/cars/delete', upload.array(), function(req, res){
	CarModel.findByIdAndRemove(req.body.licensePlate, function(err, car) {
		if(!err) {
			res.sendStatus(200);
		}
	});
});
