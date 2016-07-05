// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var port  	 = process.env.PORT || 80; 				// set the port

// configuration ===============================================================

	app.use(express.static(__dirname + '/app')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT


// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);