//Main server app

//=== setup ==/
var config = require('./config.js');
var utils = require("./utils");
var log = utils.log;
var express = require('express');
var app = express();
var database = require('./database.js');
var playlistRoutes = require("./routes/playlistAPI.js");
var userRoutes = require("./routes/userAPI.js");
var adminRoute = require("./routes/adminAPI.js")(express,config,utils,database);
var authAPI = require("./routes/authAPI");

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

//set rest api
var restRouter = (function(){
        var router = express.Router();
        userRoutes(router);
        playlistRoutes(router);
    return router;
})();

app.use(config.server.path+"/",authAPI());
app.use(config.server.path+"/rest",restRouter);
app.use(config.server.path+"/admin",adminRoute);

//serve static pages:
app.use(config.server.path,express.static(__dirname + '/public'));

//start server
app.listen(config.server.port, function(){
    log.info('App running on port '+config.server.port);
});
