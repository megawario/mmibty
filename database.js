//Database access for the server
// Instanciate the object and access database using the methods.

module.exports = function Database(connectionString){
    log = require('./utils').log;
    this.mongoose = require('mongoose');
    this.mongoose.connect(connectionString);

    //load schemas
    //mock models for accesstoken and refresh token
    this.accessToken = mongoose.model('accessToken',new  mongoose.Schema({access_token:String},{ strict: false }));
    this.refreshToken = mongoose.model('refreshToken',new mongoose.Schema({refresh_token:String}, { strict: false }));
    
    //connection events:
    this.mongoose.connection.on('connected',function(){
	log.info('Mongoose connected to: '+connectionString);
    });
    this.mongoose.connection.on('error',function(err){
	log.err('Mongoose error on connection: '+err);
    });
    this.mongoose.connection.on('disconnected',function(){
	log.warning('Mongoose disconnected');
    });

    //store refresh and auth tokens:
    this.storeAccessToken = function(json,callback){
	log.debug("storing access token");
	this.accessToken.create(json,function(err){
	    if(error) log.err(err);
	    callback(err);
	});
    };
    
    this.storeRefreshToken = function(json,callback){
	log.debug("storing refresh token");
	this.refreshToken.create(json,function(err){
	    if(error) log.err(err);
	    callback(err);
	});
    };

    //fetch
    this.getAccessToken = function(callback){
	this.accessToken.find({},function(err,docs){
	    var access_token = docs[0].access_token;
	    callback(err,access_token);
	    
	});
    };

    this.getRefreshToken= function(callback){
	this.refreshToken.find({},callback);
    };

    return this;
}
