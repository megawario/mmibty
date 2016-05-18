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
    //returns group playlist
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
		    //TODO STORE access token and refresh token in database;
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
