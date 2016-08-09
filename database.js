/**
 * @module database
 * @requires module:mongoose
 * @requires module:config
 * @requires module:utils
 * Module that contains the Database object.
 * It is tightly coupled with mongoose.js for database access
 * Returns a singleton of a Database object to be used though the application.
 */

var config = require("./config");
var log = require("./utils").log;

/**
 * @constructor Database
 * @param {string} connectionString connection string for the database
 * @param {object}  logger
 * @returns {Database} returns a database class.
 */
function Database(connectionString,log){
	this.mongoose = require("mongoose");;
	this.mongoose.connect(connectionString);


	//load schemas
	//mock models for accesstoken and refresh token
	this.accessToken = this.mongoose.model('accessToken',new  this.mongoose.Schema({access_token:String},{ strict: false }));
	this.refreshToken = this.mongoose.model('refreshToken',new this.mongoose.Schema({refresh_token:String}, { strict: false }));
	this.track = require('./models/tracks');
	this.user = require('./models/users');
	this.nuser = require('./models/nusers');

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

	/**
	 * @methodof Database
	 * Feed server statistics
	 * TODO empty method
	 */
	this.getServerStats = function(){};

	/**
	 * Feed playlist statistic
	 * will consist of: top user for each "your music" category total playtime
	 * @param callback
	 */
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
		log.debug("Fetching playlist items");
		if(err) return callback(err);
		this.track.find({}).limit(offset).exec(function(err,docs){
			if(docs.length>0){
				result = {tracks:docs,next:true};
			}else{result={tracks:docs,next:false};}
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
				if (!err && docs == ""){
					return callback(err);
//TODO fix with getTrack
				}else{ //track found
					console.log(err);
					log.debug("Track with uri "+track_uri+" has allready been added");
					callback("Track allready exists");
				}
			}).bind(this)
		);
	};

	/**
	 * Returns a doc with the track
	 * @param err
	 * @param {String} track_uri
	 * @param callback
	 */
	this.getTrack = function(err,track_uri,callback){
		this.track.find({track_uri:track_uri},function(err,doc){
			callback(err,doc[0]);
		});

	};

	/**
	 * Get tracks that are marked for removal
	 * @param err
	 * @param callback
	 * @returns {*}
	 */
	this.getMarkedTracks = function(err,callback) {
		if(err) return callback(err);
		this.track.find({deleted: true}, callback);
	}

	/**
	 * Toggles love for a user.
	 * Activating Love will delete Hate.
	 * @param err
	 * @param track_uri track to love
	 * @param user_name user name
	 * @param callback is of the form (err)
	 */
	this.trackToggleLove = function(err,track_uri,user_name,callback){
		if(err) return callback(err);
		else{
			this.track.findOne({track_uri:track_uri},function(err,doc){

				console.log(JSON.stringify(doc.love));
				if(err) return callback(err);
				if(doc.love.indexOf(user_name)==-1){
					doc.love.push(user_name);
					doc.hate.remove(user_name);
				}else{
					doc.love.remove(user_name);
				};
				if(doc.hate.length-doc.love.length>=5) //TODO change hardcoded value
					doc.deleted=true;
				else doc.deleted=false;
				doc.save(callback);
				//check if must remove
				//db.trackCheckRemove(err,track_uri)
			});
		};
	};

	/**
	 * Toggles Hate for track.
	 * Activating Hate will delete Love.
	 * @param err
	 * @param track_uri
	 * @param user_name
	 * @param callback of form (err)
	 */
	this.trackToggleHate = function(err,track_uri,user_name,callback){
		if(err) return callback(err);
		else{
			this.track.findOne({track_uri:track_uri},function(err,doc){
				if(err) return callback(err);
				if(doc.hate.indexOf(user_name)==-1){
					doc.hate.push(user_name);
					doc.love.remove(user_name);
				}else{
					doc.hate.remove(user_name);
				};
				if(doc.hate.length-doc.love.length>=5) //TODO change hardcoded value
					doc.deleted=true;
				else doc.deleted=false;
				doc.save(callback);
				//check if must remove
				//db.trackCheckRemove(err,track_uri)
			});
		};
	};

	/**
	 * Updates/Creates new user status on the database for the newly user added track
	 * @param userID
	 * @param userName
	 * @param reset If true, will reset all stat fields to default: 0
	 * @param jsonData
	 */
	this.addUserStats = function (err,userID,userName,jsonData,callback){
		if(err) return callback(err);
		this.user.findOneAndUpdate({ user:userID, user_name:userName},{},
			{upsert:true, new:true},
			function(err,doc){
				if(err){
					log.err(err);
				}else {
					//compile information
					var prev_percent = doc.song_number / (doc.song_number + 1);
					doc.song_number += 1;
					doc.danceability = doc.danceability * prev_percent + jsonData.stats.danceability / doc.song_number;
					doc.energy = doc.energy * prev_percent + jsonData.stats.energy / doc.song_number;
					doc.loudness = doc.loudness * prev_percent + jsonData.stats.loudness / doc.song_number;
					doc.speechiness = doc.speechiness * prev_percent + jsonData.stats.speechiness / doc.song_number;
					doc.acousticness = doc.acousticness * prev_percent + jsonData.stats.acousticness / doc.song_number;
					doc.instrumentalness = doc.instrumentalness * prev_percent + jsonData.stats.instrumentalness / doc.song_number;
					doc.liveness = doc.liveness * prev_percent + jsonData.stats.liveness / doc.song_number;
					doc.valence = doc.valence * prev_percent + jsonData.stats.valence / doc.song_number;
					doc.duration_ms += jsonData.stats.duration_ms;

					doc.save(function(err){
						callback(err);
					});
				}
			});


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
	 * 3 - calculate user new music stats
	 * @param error error to propagate
	 * @param dataJson all data required to add the song correctly
	 */
	this.addTrack= function(err,dataJson,callback){
		if(err) return callback(err);

		//add features to track
		var feat = dataJson.track_features;
		var info = dataJson.track_info;
		var result={};

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
			singer_url: info.artists[0].external_urls.spotify,
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
		this.track.create(result,
			function (err) {
				if(err) return callback("Could not add the required track to database");
					this.addUserStats(err,result.user,result.user_name,result,function(err){
					if(err) return callback("Could not add the required track to database");
					return callback(err);
				});
		})
	};

	/**
	 * Remove track from playlist
	 * 1 - remove track from spotify
	 * 2 - remove track from database
	 * 3 - recalculate statistics
	 * @param err
	 * @param user_id
	 * @param track_uri
	 * @param callback (err)
	 */
	this.removeTrack = function(err,track_uri,callback){
		if(err) return callback(err);
		this.track.remove({track_uri:track_uri},function(err,doc){
			if(doc.result.n==0) err= "Track allready removed";
			return callback(err);
		});
	};

	/**
	 * Gets information regarding a track
	 * @param userID
	 * @param callback
	 */
	this.getTrackInfo = function(userID,callback){
		this.user.find({user:userID},function(err,doc){
			if(err) callback(err);
			else callback(null,doc[0]);
		});
	};

	/**
	 * Resets user tracks stats to 0.
	 * @param err
	 * @param userID
	 * @param callback
	 * @returns {*}
	 */
	this.resetUserStats = function(err,userID,callback) {
		if (err) return callback(err);
		this.user.findOneAndUpdate({user: userID}, {}, {},
			function (err, doc) {
				if (err) {
					log.err(err);
				}
				else {
					doc.song_number = 0;
					doc.danceability = 0;
					doc.energy = 0;
					doc.loudness = 0;
					doc.speechiness = 0;
					doc.acousticness = 0;
					doc.instrumentalness = 0;
					doc.liveness = 0;
					doc.valence = 0;
					doc.duration_ms = 0;
					doc.save(function (err) {
						callback(err);
					});
				}
			});
	};

	/**
	 * Runs through all songs, and recalculates all fields.
	 * 1 - resets all.
	 * 2 - run through all musics
	 * 3 - recalculates using addUserStats
	 * @param err
	 * @param userID
	 */
	this.recalculateUserStats = function(err,userID,userName,callback){
		if(err) return callback(err);
		else {
			this.resetUserStats(err, userID, function(err){
				this.track.find({user: userID}, function (err, docs) {
					for (var i = 0; i < docs.length; i++) {
						addUserStats(err, userID, userName, docs[i],function (err) {
							if (err) log.err("Failed calculating stats: ") + err;
						});
					}
				});
			});
		}
	};
	
	// ================================ Admin Ops =============================== //

	/**
	 * @memberof Database
	 * Adds new user to database
	 * @param {String} userID
	 * @param {String} userName
	 * @param callback
	 */
	this.adminAddUser = function(userID,userName,callback){
		this.user.findOneAndUpdate({user:userID, user_name:userName},{},
			{upsert:true, new:true},
			function(err,doc){
				//TODO process necessary info
				return callback(err);
			}
		);

	};

	/**
	 * removes new user to database and does cleanup
	 * @param {String} userID
	 * @param callback
	 */
	this.adminRemoveUser = function(userID,callback){
		this.user.findOneAndRemove({user:userID},function(err,doc){
			//todo process cleanup here
			return callback(err);
		})
	};

	/**
	 * fetches all available users
	 * @param callback
	 */
	this.adminGetUsers = function(callback){
		this.user.find({},'user user_name',function(err,docs){
			return callback(err,docs);
			if(err) return callback(err);
			else return callback(err,doc)
		})
	};

	/**
	 * Checks if user exists on database
	 * @param {String} userID
	 * @param callback
	 */
	this.adminCheckUserAuth = function(userID,callback){
		this.user.findOne({user:userID},'user_name',function(err,doc){
			if(doc == null) err="Not found";
			return callback(err,doc);
		});
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

	/**
	 * Store access token
	 * @param json access token
	 */
	this.storeAccessToken = function(json){
		log.debug("storing access token");
		//remove all access tokens:
		this.accessToken.remove({}).exec(); //not waiting for server response
		this.accessToken.create(json,function(err){
			if(err) log.err(err);
		});
	};

	/**
	 * Store refresh token
	 * @param json refresh token
	 */
	this.storeRefreshToken = function(json){
		log.debug("storing refresh token");
		this.refreshToken.remove({}).exec(); //not waitin for server response
		this.refreshToken.create(json,function(err){
			if(err) log.err(err);
		});
	};

	/**
	 * Retreives access token
	 * @param callback
	 */
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

	/**
	 * Retreives refresh token
	 * @param callback
	 */
	this.getRefreshToken= function(callback){
		this.refreshToken.find({},callback);
	};

	this.authUser = function(email,password){
		return new Promise(
			(function(resolve,reject){
				this.nuser.findOne({email:email},
					function(err,doc){
						if(err || doc == null || doc.password!=password){return reject(err)}
						return resolve(doc);
					})
			}).bind(this)
		);
	}

	// ================================ User ============================= //
	/**
	 *
	 * @param user must be in line with the schema definition of nuser
	 * @returns {Promise} returns a promisse, with resolve if successful
     */
	this.createUser = function(user){

		var promise = new Promise(
			(function(resolve,reject){

				this.nuser.findOne({email:user.email},
					(function(err,doc){
						if(doc != null){ return reject(Error("user allready exists"));};
						if(err){return reject(Error("the following error occured: "+err));}
						else{
							newUser = new this.nuser({
								username:user.username,
								email:user.email,
								password:user.password});
							newUser.save(function(err){
								if(err) reject(err);
								else resolve();
							})
						}
					}).bind(this)
				)
			}).bind(this)
		);
		//promise.bind(this);
		return promise;
		};
}

//use as a singleton due to require cache.
var database = new Database(config.server.dbURL,log);
module.exports = database;
