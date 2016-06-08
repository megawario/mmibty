module.exports = function(express,config,utils,database){

	var router = express.Router();
	var bodyParser= require("body-parser");
	var request = require("request");
	var log = utils.log;
	var ipv4 = utils.ipv4;
	var db = database;

	//allways log access
	router.use(function logRequest(req,res,next){
		log.info('request from '+ipv4(req.ip)+' to '+req.path);
		next();
	});

	//allways authorize remote address
	router.use(function(req,res,next){
		var remote = ipv4(req.connection.remoteAddress);
		log.debug("Checking auth for "+remote +"with config.auth: "+config.auth[remote]);
		if(config.auth[remote] === "undefined"){
			res.sendStatus(403); //TODO redirect to forbidden page
		}else{
			next();
		}
	});

	router.use(bodyParser.json());

	// ============================================================= USER =================================================================================== //

	//gets user stats and info
	router.get('/user/stats',function(req,res){
		var remote = ipv4(req.connection.remoteAddress);
		db.getTrackInfo(remote,function(err,doc){
			if(err) res.sendStatus(500);
			else res.json(doc);
		})
	});

	//get name associated with the machine
	router.get('/user/name/',function(req,res){
		var remote =ipv4(req.connection.remoteAddress);
		if(remote!=="undefined") res.json({name:config.auth[remote]});
		else res.sendStatus(500); //server Error
	});

	//checks if user is admin
	router.get('/user/admin/',function(req,res){
		var remote =ipv4(req.connection.remoteAddress);
		if(remote!=="undefined" && remote === config.master) res.sendStatus(200); //OK
		else res.sendStatus(403); //not auth
	});

	// =============================================================================== PLAYLIST ============================================================= //

	router.get('/playlist/status',function(req,res){
		db.getPlaylistStats();
	});
	//gets track on group playlist
	router.get('/playlist/',function(req,res){
		db.getAccessToken(function(err,access_token){
			if(err){
				res.sendStatus(500);
			}else{
				var authHeader= {
					url: "https://api.spotify.com/v1/users/"+config.spot.userid+"/playlists/"+config.spot.playlist+"/tracks",
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};
				var request = new require("request");
				request.get(authHeader,function(err, response, body){
					//TODO modify the request to send info about song preference here
					if(err || typeof body.error === undefined){ //error if service down
						res.sendStatus(500);
					}else{
						res.status(200).json(body);
					}
				});
			}
		});

	});

	//add tracks
	/**
	 * Adds tracks to the playlist and associated db documents.
	 * 1 - verify if exists
	 * 2 - add to playlist
	 * 3 - fetch track information
	 * 4 - save on DataBase the information
	 * 5 - in case of failure remove from playlist
	 * 6 - in case of remove failure notify admin in order to remove manualy from list
	 * 7 - notify that song was not added
	 * 8 - if everything went OK say so!
	 */
	router.post('/playlist/track/addtest',function(req,res){
		log.debug("track to add: "+req.body.track_uri+" by user: "+req.connection.remoteAddress);
		var track_uri = req.body.track_uri;
		var user = ipv4(req.connection.remoteAddress);
		var user_name = config.auth[user];
		//1 - check on db if exists
		db.trackExists(null,track_uri,function(err){
				if(err) return res.status(500).json({error:"Cannot add existing track - it allready exists"});
				else{
					this.spotAddTrack(err,track_uri, function(err){      				//2 - add to playlist
						this.spotGetTrackInfo(err,track_uri, function(err,jsonData){	//3-get track info
							db.addTrack(err,jsonData,function(err){ 					//4 - add track info
								if(err){
									//5 - remove track from playlist
									this.spotRemoveTrack(err,track_uri,function(err){
										if(err) {
											//6 - remove manualy - log critital error and return generic mesage to user
											log.err("ERROR - MANUAL - Please remove " + track_uri + " from playlist manualy.");
										}

										//7 - could not add song (end of callback error chain)
										log.debug("Failed to add song due to: "+err);
										return res.status(500).json({error:"Cannot add track we are very sorry :(",message:err});

									});
								}
								else{ //8 - Everything went OK
									return res.sendStatus(201); //created
								}
							})}
						)}
					)
				}
			}
		)
	});


//add tracks
	/**
	 * Adds tracks to the playlist and associated db documents.
	 * 1 - verify if exists
	 * 2 - add to playlist
	 * 3 - fetch track information and save on DataBase
	 * 4 - in case of failure remove from playlist
	 */
	router.post('/playlist/track/add',function(req,res){
		log.debug("track to add: "+req.body.track_uri+" by user: "+req.connection.remoteAddress);
		var track_uri = req.body.track_uri;
		var user = ipv4(req.connection.remoteAddress);
		var user_name = config.auth[user];
		//check on db if exists

		db.addTrack({'track_uri':track_uri,'user':user,'user_name':user_name},
			function(err){
				if(err){ //TODO diferentiate error types
					res.sendStatus(500);
				}
				else{ //success
					//add track to the playlist

					db.getAccessToken(function(err,access_token){
						if(err){ //TODO diferentiate error
							req.sendStatus(500);
						}else{
							var authHeader= {
								url: "https://api.spotify.com/v1/users/"+config.spot.userid+"/playlists/"+config.spot.playlist+"/tracks?uris="+track_uri,
								headers: { 'Authorization': 'Bearer ' + access_token },
								json: true
							};

							request.post(authHeader,function(error, response, body){
								if(error) res.sendStatus(500); //failed TODO remove transaction
								else{
									//successfully added in database
									res.sendStatus(200);

									//add to user info statistics
									authHeader.url = "https://api.spotify.com/v1/audio-features/"+track_uri.replace("spotify:track:","");
									log.debug(authHeader.url);
									request.get(authHeader,function(error,response,body){
										if(err) log.err("Failed to add user info");
										else{
											db.addTrackInfo(user,user_name,body);
										}
									});


								}
							} )
						}
					});
				}
			});
	});
// ===================================== SPOTYFY API REQUESTS================================================== //

	/**
	 * Add track to spotify defined playlist
	 * 1 - fetch authHeader
	 * 2 - make post to spotify API
	 *
	 * Masks errors to return the error form this step.
	 * @param track_uri uri for the spotify track
	 * @param callback
	 */
	this.spotAddTrack = function(err,track_uri,callback){
		if(err) return callback(err);
		var url = "https://api.spotify.com/v1/users/"+
			config.spot.userid+"/playlists/"+
			config.spot.playlist+"/tracks?uris="+track_uri;

		// 1 - fetch auth
		db.getAuthHeader(err,url,function(err,header){
			if(err) return callback("Could not add track to spotify");
			request.post(header,function(error, response, body){
				if(error) return callback("Could not add track to spotify");
					//successfully added in database
					res.sendStatus(200);
				});

		});
	};

	this.spotRemoveTrack = function(error,track_uri,callback){
		if(error) return callback(error);
		console.log("Remove track from playlist");
		if(err) return callback("Could not remove track from spotify");
	}

	this.spotGetTrackInfo = function(error,track_uri,callback){
		if(error) return callback(error);
		console.log("SPOT - force error on track info");
		var err="could not get";
		if(err) return callback("Could not get track info from spotify");

	};

// ===================================== AUTH ================================================================= //
	var querystring = require("querystring");

	router.get('/login', function(req, res) {
		//check if admin:
		var remote = ipv4(req.connection.remoteAddress);
		if(remote!=="undefined" && remote === config.master){
			var state = utils.randomString(16);
			res.cookie('spotify_auth_state', state);

			// your application requests authorization
			res.redirect('https://accounts.spotify.com/authorize?' +
				querystring.stringify({
					response_type: 'code',
					client_id: config.spot.clientID,
					scope: config.spot.scope,
					redirect_uri: config.spot.redirectURI,
					state: state
				}));
		}else{
			log.debug("Could not login - not admin");
		}
	});

//callback of auth
	router.get('/callback', function(req, res) {
		console.log("calling callback");

		// your application requests refresh and access tokens
		// after checking the state parameter
		var code = req.query.code || null;
		var state = req.query.state || null;
		console.log("my code is: "+code);
		//var storedState = req.cookies ? req.cookies[stateKey] : null;
		console.log("my state is: "+state);
		//TODO bypass the stored state for now
		if (false){//state === null || state !== storedState) {
			//state mismatch
			res.sendStatus(500); //TODO redirect to a safe page
		} else {
			//fetch token with auth code;

			//res.clearCookie(stateKey);
			//create auth option json
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				form: {
					code: code,
					redirect_uri: config.spot.redirectURI,
					grant_type: 'authorization_code'
				},
				headers: {
					'Authorization': 'Basic ' + (new Buffer(config.spot.clientID + ':' + config.spot.clientSecret).toString('base64'))
				},
				json: true
			};

			//send request for secret token for spotify
			request.post(authOptions, function(error, response, body) {
				if (!error && response.statusCode === 200) {

					var access_token = body.access_token;
					var refresh_token = body.refresh_token;

					var options = {
						url: 'https://api.spotify.com/v1/me',
						headers: { 'Authorization': 'Bearer ' + access_token },
						json: true
					};
					console.log("My access token is: "+access_token);
					console.log("My refresh token is: "+refresh_token);

					//store tokens in database
					db.storeAccessToken({"access_token":access_token});
					db.storeRefreshToken({"refresh_token":refresh_token});
					res.redirect(200, config.server.path);

				} else { //INVALID redirect
					res.sendStatus(500);
				}
			});
		}
	});

	return router;
}
