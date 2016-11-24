var express = require('express');
var app = express();
exports.app = app;
var cors = require('cors');
var fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
exports.upload = upload;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var url = 'mongodb://localhost/parking-lot-api';

mongoose.Promise = global.Promise;
mongoose.connect(url);

fs.readdirSync(__dirname + '/models').forEach(function(filename) {
	if(~filename.indexOf('.js')) {
		require(__dirname + '/models/' + filename);
	}
});

fs.readdirSync(__dirname + '/routes').forEach(function(filename) {
	if(~filename.indexOf('.js')) {
		require(__dirname + '/routes/' + filename);
	}
});

app.listen(3000);


