module.exports = function(express,config,utils,database){
    
    var router = express.Router();
    var bodyParser= require("body-parser");
    var request = require("request");
    var log = utils.log;
    var db = database;
    router.use(function logRequest(req,res,next){
	log.info('request from '+req.ip+' to '+req.path);
	next();
    });

    //allways authorize remote address //TODO improve on performance by preprocessing requests here for information.
    router.use(function(req,res,next){
	var remote = req.connection.remoteAddress;
	log.debug("Checking auth for "+remote +"with config.auth: "+config.auth[remote]);
	if(config.auth[remote] === "undefined"){
	    res.sendStatus(403); //TODO redirect to forbidden page
	}else{
	    next();
	}
    });

    router.use(bodyParser.json());

    //GET
    //get name associated with the machine
    router.get('/name/',function(req,res){
	var remote =req.connection.remoteAddress;
	if(remote!=="undefined") res.json({name:config.auth[remote]});
	else res.sendStatus(500); //server Error
    });

    //checks if user is admin
    router.get('/admin/',function(req,res){
	var remote =req.connection.remoteAddress;
	console.log("remote is: "+remote+" master "+config.master);
	if(remote!=="undefined" && remote === config.master) res.sendStatus(200); //OK
	else res.sendStatus(500); //server Error
    });

   
    // =============================================================================== PLAYLIST ============================================================= //

    //gets track on group playlist
    router.get('/playlist/',function(req,res){
	db.getAccessToken(function(err,access_token){
	    if(err){
		req.sendStatus(500);
	    }else{
		var authHeader= {
		    url: "https://api.spotify.com/v1/users/"+config.spot.userid+"/playlists/"+config.spot.playlist+"/tracks",
		    headers: { 'Authorization': 'Bearer ' + access_token },
		    json: true
		};
		var request = new require("request");
		request.get(authHeader,function(error, response, body){
		    res.json(body);
		} )
	    }
	});
	
    });

    
    //add traks
    //TODO should rollback if fails.
    router.post('/playlist/track/add',function(req,res){
	log.debug("track to add: "+req.body.track_uri+" by user: "+req.connection.remoteAddress);
	var track_uri = req.body.track_uri;
	var user = req.connection.remoteAddress;
	var user_name = config.auth[user];
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
						    console.log("MA HOT BOD: "+JSON.stringify(body));
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
    
    // =============================================================================== AUTH ================================================================= //
    var querystring = require("querystring");
    router.get('/login', function(req, res) {

	var state = utils.randomString(16);
	res.cookie('spotify_auth_state', state);
1
	// your application requests authorization
	res.redirect('https://accounts.spotify.com/authorize?' +
		     querystring.stringify({
			 response_type: 'code',
			 client_id: config.spot.clientID,
			 scope: config.spot.scope,
			 redirect_uri: config.spot.redirectURI,
			 state: state
		     }));
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
		    res.sendStatus(200);
		} else { //INVALID redirect
		    res.sendStatus(500);
		}
	    });
	}
    });
	    
    return router;
}
