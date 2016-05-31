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
    this.user = mongoose.model("user",new mongoose.Schema({"user":String,
							   "user_name":String,
							   "song_number": { type: Number, default:1},
							   "danceability": {type: Number, default: 0},
							   "energy": {type: Number, default: 0},
							   "key": {type: Number, default: 0},
							   "loudness": {type: Number, default: 0},
							   "mode": {type: Number, default: 0},
							   "speechiness": {type: Number, default: 0},
							   "acousticness": {type: Number, default: 0},
							   "instrumentalness": {type: Number, default: 0},
							   "liveness": {type: Number, default: 0},
							   "valence": {type: Number, default: 0},
							   "tempo": {type: Number, default: 0},
							   "duration_ms": {type: Number, default: 0}
							  }));
    
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
    };

    this.addTrackInfo = function(userID,userName,jsonData){
	console.log("JsonData "+jsonData.energy);
	this.user.findOneAndUpdate({ user:userID, user_name:userName},{},
			  {upsert:true, new:true},
			  function(err,doc){
			      if(err){
				  log.err(err)
				  console.log(doc);
			      }else {
				  doc.song_number += 1;
				  doc.danceability += parseInt(jsonData.danceability/doc.song_number);
				  doc.energy += parseInt(jsonData.energy/doc.song_number);
				  doc.loudness += parseInt(jsonData.loudness/doc.song_number);
				  doc.speechiness +=parseInt(jsonData.speechiness/doc.song_number);
				  doc.acousticness +=parseInt(jsonData.acousticness/doc.song_number);
				  doc.instrumentalness +=parseInt(jsonData.instrumentalness/doc.song_number);
				  doc.liveness += parseInt(jsonData.liveness/doc.song_number);
				  doc.duration_ms +=parseInt(jsonData.duration_ms);
				  doc.save(function(err){
				      if(err) log.err(err);
				      else console.log("added with success");
				  });
			      }
			      
			  });
	/*
	this.user.findOneAndUpdate(
				    { $inc : {
					danceability: parseInt({ $divide : [parseInt(jsonData.danceability),"$song_number"]}),
					energy: parseInt({ $divide : [parseInt(jsonData.energy),"$song_number"]}),
					loudness: parseInt({ $divide : [parseInt(jsonData.loudness),"$song_number"]}),
					speechiness: parseInt({ $divide : [parseInt(jsonData.speechiness),"$song_number"]}),
					acousticness: parseInt({ $divide : [parseInt(jsonData.acousticness),"$song_number"]}),
					instrumentalness: parseInt({ $divide : [parseInt(jsonData.instrumentalness),"$song_number"]}),
					liveness: parseInt({ $divide : [parseInt(jsonData.liveness),parseInt("$song_number")]}),
					duration_ms: parseInt(jsonData.duration_ms) 
				    }},
				    {upsert:true,y
				     setDefaultsOnInsert: true
				    },
				    function(err,doc){
					if(err){log.debug(err);}
					else{
					    //it was successfuly inserted
					    console.log("it was successfull");
					};
					
				    });*/
	
    };

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
