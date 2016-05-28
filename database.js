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
    this.track = mongoose.model("track",new mongoose.Schema({track_uri:String,user:String,user_name:String}));
    
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

    //
    //set track - this adds track to the database. it track exists it will do nothing.
    this.addTrack = function(json,callback){
	//json will contain track_id, machine_ip and user name
	//check if track has been added if not, add
	this.track.find({'track_uri':json.track_uri},
			(function(err,docs){
			    console.log("my docs have: "+docs);
			    if (!err && docs == ""){
				console.log("Not error and doc is not defined ie does not exist");
				this.track.create(json,function(err){
				    if(err) log.err(err);
				    callback(err);
				});
			    }else{ //todo diferenciate error
				console.log(err);
				log.debug("track has allready been added!!");
				callback("track allready exists");
			    }
			}).bind(this)
		       );
    }

    // ================================ AUTH =============================== //
    //store refresh and auth tokens:
    this.storeAccessToken = function(json){
	log.debug("storing access token");
	//remove all access tokens:
	this.accessToken.remove({}).exec(); //not waiting for server response
	this.accessToken.create(json,function(err){
	    if(err) log.err(err);
	});
    };
    
    this.storeRefreshToken = function(json){
	log.debug("storing refresh token");
	this.refreshToken.remove({}).exec(); //not waitin for server response
	this.refreshToken.create(json,function(err){
	    if(err) log.err(err);
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
