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
	this.track = require('./models/tracks');
	this.user = require('./models/users');

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

	//=================================================== STATS ===========================================//

	//feed server statistic
	this.getServerStats = function(){};

	//feed playlist statistic
	//will consist of: top user for each "your music" category total playtime
	this.getPlaylistStats = function(callback){
		//fetch max
		var queryMaxSong = this.user.findOne({}).sort({song_number:-1});
		var queryMaxValence = this.user.findOne({}).sort({valence:-1});
		var queryMaxDuration = this.user.findOne({}).sort({duration_ms:-1});
		var queryMaxAcoustic = this.user.findOne({}).sort({acousticness:-1});
		var queryMaxIntrumental = this.user.findOne({}).sort({instrumentalness:-1});
		var queryMaxLiveness = this.user.findOne({}).sort({liveness:-1});
		var queryMaxLoudness = this.user.findOne({}).sort({loudness:-1});
		var queryMaxEnergy = this.user.findOne({}).sort({energy:-1});
		var queryMaxDance = this.user.findOne({}).sort({dancebility:-1});

		//fetch min
		var queryMinSong = this.user.findOne({}).sort({song_number:1});
		var queryMinValence = this.user.findOne({}).sort({valence:1});
		var queryMinDuration = this.user.findOne({}).sort({duration_ms:1});
		var queryMinAcoustic = this.user.findOne({}).sort({acousticness:1});
		var queryMinIntrumental = this.user.findOne({}).sort({instrumentalness:1});
		var queryMinLiveness = this.user.findOne({}).sort({liveness:1});
		var queryMinLoudness = this.user.findOne({}).sort({loudness:1});
		var queryMinEnergy = this.user.findOne({}).sort({energy:1});
		var queryMinDance = this.user.findOne({}).sort({dancebility:1});

		var result = {};

		queryMaxSong.exec().bind(result).then(
			function(doc){this.maxSong={name:doc.user_name,song_number:doc.song_number};}
		);
		console.log("result is:" +result.maxSong);
		console.log("MY max result is: "+result.maxSong.name+result.maxSong.song_number);

		//fetch min

	}

	//=================================================== PLAYLIST ========================================//

	/**
	 * Returns an object with the registering of the playlists.
	 * //TODO implement offset - related to route /playlist/
	 * @param err
	 * @param offset number of tracks from where to read;
	 * @param callback will receive and object containing extra info.
     */
	this.getPlaylistTracks = function(err,offset,callback){
		if(err) return callback(err);
		this.track.find({},function(err,docs){

			result={tracks:docs,next:"null"}

			return callback(err,result);
		});

	};

	/**
	 * Checks if the track exists on database
	 * @param track_uri URI for the track to be found
	 * @param callback will receive (err) if track exists
	 */
	this.trackExists = function(err,track_uri,callback){
		//check if track has been added if not, add
		this.track.find({'track_uri':track_uri},
			(function(err,docs){
				if (!err && docs == ""){ //track not found pass on
					return callback(err);
					
					//this.track.create(json,function(err){
					//	if(err) log.err(err);
					//	callback(err);
					//});
				}else{ //track found
					console.log(err);
					log.debug("Track with uri "+track_uri+" has allready been added");
					callback("Track allready exists");
				}
			}).bind(this)
		);
	};

	/**
	 * Adds track to the playlist storing all the required information.
	 * The dataJson must contain the following fields:
	 *  - track_features, track_info
	 *
	 * If does not contain a error will be passed to the callback
	 *
	 * 1 - form the database json
	 * 2 - store it in the database
	 * @param error error to propagate
	 * @param dataJson all data required to add the song correctly
     */
	this.addTrack= function(err,dataJson,callback){
		if(err) return callback(err);

		//add features to track
		var feat = dataJson.track_features;
		var info = dataJson.track_info;

		var result={};
		console.log(JSON.stringify(info));
		result.stats = {
			image:{
				small: info.album.images[2].url,
				normal: info.album.images[1].url,
				big: info.album.images[0].url
			},
			preview: info.preview_url,
			album: info.album.name,
			name: info.name,
			singer: info.artists[0].name,
			danceability : feat.danceability,
			energy : feat.energy,
			key : feat.key,
			loudness : feat.loudness,
			speechiness : feat.speechiness,
			mode : feat.mode,
			acousticness : feat.acousticness,
			instrumentalness: feat.instrumentalness,
			liveness : feat.liveness,
			valence : feat.valence,
			tempo : feat.tempo,
			duration_ms:feat.duration_ms	
		};

		result.track_uri = info.uri;
		result.user = dataJson.user;
		result.user_name = dataJson.user_name;  //user_name that added song

		// 2 - send to the database
		this.track.create(result, function (err) {
			console.log(err);
			if(err) return callback("Could not add the required track to database");
			return callback(err);
		})

	};

	this.getTrackInfo = function(userID,callback){
		this.user.find({user:userID},function(err,doc){
			if(err) callback(err);
			else callback(null,doc[0]);
		});
	};

	this.addTrackInfo = function(userID,userName,jsonData){
		this.user.findOneAndUpdate({ user:userID, user_name:userName},{},
			{upsert:true, new:true},
			function(err,doc){
				if(err){
					log.err(err);
					console.log(doc);
				}else {
					//compile information
					var prev_percent = doc.song_number/(doc.song_number+1);
					doc.song_number += 1;
					doc.danceability = doc.danceability * prev_percent + jsonData.danceability/doc.song_number;
					doc.energy = doc.energy * prev_percent + jsonData.energy/doc.song_number;
					doc.loudness = doc.loudness * prev_percent + jsonData.loudness/doc.song_number;
					doc.speechiness = doc.speechiness * prev_percent + jsonData.speechiness/doc.song_number;
					doc.acousticness = doc.acousticness * prev_percent + jsonData.acousticness/doc.song_number;
					doc.instrumentalness = doc.instrumentalness * prev_percent + jsonData.instrumentalness/doc.song_number;
					doc.liveness = doc.liveness * prev_percent + jsonData.liveness/doc.song_number;
					doc.valence = doc.valence * prev_percent + jsonData.valence/doc.song_number;
					doc.duration_ms += jsonData.duration_ms;
					doc.save(function(err){
						if(err) log.err(err);
						else console.log("added with success");
					});
				}
			});
	};

	// ================================ Admin Ops =============================== //

	//adds new user to database
	this.adminAddUser = function(userID,userName,callback){
		this.user.findOneAndUpdate({user:userID, user_name:userName},{},
			{upsert:true, new:true},
			function(err,doc){
				//TODO process necessary info
				return callback(err);
			}
		);

	};
	//removes new user to database and does cleanup
	this.adminRemoveUser = function(userID,callback){
		this.user.findOneAndRemove({user:userID},function(err,doc){
			//todo process cleanup here
			return callback(err);
		})
	};

	this.adminGetUsers = function(callback){
		this.user.find({},'user user_name',function(err,docs){
			return callback(err,docs);
			if(err) return callback(err);
			else return callback(err,doc)
		})
	};

	// ================================ AUTH =============================== //

	/**
	 * Returns the authentication header necessary to use the API.
	 * On err, token will be null and err filled.
	 * Auth header is a JSON acording to spotify API.
	 * Will be responsible to handle possible reconnects.
	 * @param err
	 * @param url
	 * @param callback has to receive (err,authHeader)
     */
	this.getAuthHeader = function(err,url,callback){
		this.getAccessToken(function(err,token){
			var authHeader= {
				url: url,
				headers: { 'Authorization': 'Bearer ' + token },
				json: true
			};
			callback(err,authHeader);
		});	
	};
	
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
			if(err ||docs[0]==undefined){
				err = "could not fetch the access token from database";
				log.err(err);
				callback(err);
			}else{
				var access_token = docs[0].access_token;
				callback(err,access_token);
			}
		});
	};

	this.getRefreshToken= function(callback){
		this.refreshToken.find({},callback);
	};

	return this;
}
