//Main server app

var config = require('./config.js');
var log = require("./utils").log;

//set debug mode according to config
if(config.server.debug){
    process.env.NODE_ENV="development";
    log.warning("Development mode on");
}else{ process.env.NODE_ENV="production";}

//catch errors and log.
process.on('uncaughtException',function(err){
    log.err('Caught exception: '+err);
    log.err('Caught exception: '+err.stack);
});


var express = require('express');
var app = express();
var routes = require("./routes/playlistAPI.js")(express,config,log);


app.use(config.server.path+"/rest",routes);

//serve static pages:
app.use(config.server.path,express.static(__dirname + '/public'));


//start server
app.listen(config.server.port, function(){
    log.info('App running on port '+config.server.port);
});
