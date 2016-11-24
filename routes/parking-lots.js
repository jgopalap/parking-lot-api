var app = require('../server').app;
var upload = require('../server').upload;
var ParkingLotModel = require('../models/parking-lot').ParkingLotModel;


app.get('/parkingLots', function(req, res) {
	ParkingLotModel.findById(req.query.id, function(err, parkingLot) {
		if(!err) {
			res.json(parkingLot);
		}
	})
});

app.post('/parkingLots/add', upload.array(), function(req, res){
	var parkingLotItem = {
		_id: req.body.id,
		name: req.body.name,
		address: req.body.address,
		capacity: req.body.capacity,
		parkingSpots: [req.body.parkingSpots]
	};
	
	var parkingLot = new ParkingLotModel(parkingLotItem);
	parkingLot.save(function(err, parkingLot) {
		if(!err) {
			res.sendStatus(200); 
		}
	});
});

app.put('/parkingLots/update', upload.array(), function(req, res){
	ParkingLotModel.findById(req.body.id, function(err, parkingLot) {
  		parkingLot.name = req.body.name;
  		parkingLot.address = req.body.address;
  		parkingLot.capacity = req.body.capacity;
  		parkingLot.parkingSpots = req.body.parkingSpots;
  		parkingLot.save(function(err, parkingLot) {
  			if(!err) {
  				res.sendStatus(200);
  			}
  		});
  	});

});

app.delete('/parkingLots/delete', upload.array(), function(req, res){
	ParkingLotModel.findByIdAndRemove(req.body.id, function(err, parkingLot) {
		if(!err) {
			res.sendStatus(200);
		}
	});
});

app.get('/parkingLots/parkingSpots', function(req, res) {
	ParkingLotModel.findOne({'parkingSpots._id': 'req.query.id'}, function(err, parkingLot) {
		if(!err) {
			res.json(parkingLot.parkingSpots[0]);
		}
	})
})

app.post('/parkingLots/parkingSpots/add', upload.array(), function(req, res){

	var parkingSpotItem = {
		_id: req.body.id,
		size: req.body.size,
		location: req.body.location,
		occupied: req.body.occupied
	};
	

	ParkingLotModel.findById(req.body.parkingLotId, function(err, parkingLot){
		if(!err) {
			parkingLot.parkingSpots.push(parkingSpotItem);
			parkingLot.save(function(err, parkingLot) {
				if(!err) {
					res.sendStatus(200);
				}
			});
		}
	});

});

app.put('/parkingLots/parkingSpots/update', upload.array(), function(req, res) {
	ParkingLotModel.findById(req.body.parkingLotId, function(err, parkingLot) {
		parking.parkingSpots.findById(req.body.id, function(err1, parkingSpot) {
			parkingSpot.size = req.body.size;
			parkingSpot.location = req.body.location;
			parkingSpot.occupied = req.body.occupied;
			parkingLot.save(function(err, parkingLot) {
				if(!err) {
					res.sendStatus(200);
				}
			});
		})
  	});

});

app.delete('/parkingLots/parkingSpots/delete', upload.array(), function(req, res) {
	ParkingLotModel.findById(req.body.parkingLotId, function(err, parkingLot) {
		parkingLot.parkingSpots.findByIdAndRemove(req.body.id);
		parkingLot.parkingSpots.save(function(err, parkingSpot) {
			if(!err) {
				res.sendStatus(200);
			}
		});	
	});
});
