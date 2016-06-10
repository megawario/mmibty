/**
 * Created by mpinto on 07/06/16.
 * Handles the routes for most User services
 */

module.exports = function(express,config,utils,database){

    var router = express.Router();
    var bodyParser= require("body-parser");
    var request = require("request");
    var log = utils.log;
    var ipv4 = utils.ipv4;
    var db = database;

    //Allways log access
    router.use(function logRequest(req,res,next){
        log.info('Admin request from '+ipv4(req.ip)+' to '+req.path);
        next();
    });

    //allways check if authorized
    router.use(function(req,res,next){
        var remote = ipv4(req.connection.remoteAddress);
        if(config.master != remote){
            res.sendStatus(403); //TODO redirect to forbidden page not admin
        }else{
            log.warning("Admin access authorized for "+remote);
            next();
        }
    });

    router.use(bodyParser.json());

    // ============================================================= USER =================================================================================== //

    //creates a new user
    router.post('/createuser',function(req,res){
        var remote = ipv4(req.connection.remoteAddress);
        var userID = req.body.userID;
        var userName = req.body.userName;
        db.adminAddUser(userID,userName,function(err){
            if(err) res.send(500).json(err); //TODO fix http status code
            else {res.sendStatus(200);}
        });
    });

    router.post('/removeuser',function(req,res){
        var remote = ipv4(req.connection.remoteAddress);
        var userID = req.body.userID;
        db.adminRemoveUser(userID,function(err){
            if(err) res.sendStatus(500); //TODO fix html status code
            else {res.sendStatus(200);}
        });
    });

    //get users (name and ip)
    router.get('/users',function(req,res){
        var remote = ipv4(req.connection.remoteAddress);
        db.adminGetUsers(function(err,docs){
            if(err) res.send(500).json(err); //TODO fix html status code
            else {
                res.status(200).json(docs);}
        });
    });

    //checks if user is admin
    router.get('/isadmin/', function (req, res) {
        var remote = ipv4(req.connection.remoteAddress);
        if (remote !== "undefined" && remote === config.master) res.sendStatus(200); //OK
        else res.sendStatus(403); //not auth
    });

    // =============== AUTH ==========//
    var querystring = require("querystring");

    router.get('/login', function (req, res) {
        //check if admin:
        var remote = ipv4(req.connection.remoteAddress);
        if (remote !== "undefined" && remote === config.master) {
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
        } else {
            log.debug("Could not login - not admin");
        }
    });

    //callback of auth
    router.get('/callback', function (req, res) {
        console.log("calling callback");

        // your application requests refresh and access tokens
        // after checking the state parameter
        var code = req.query.code || null;
        var state = req.query.state || null;
        console.log("my code is: " + code);
        //var storedState = req.cookies ? req.cookies[stateKey] : null;
        console.log("my state is: " + state);
        //TODO bypass the stored state for now
        if (false) {//state === null || state !== storedState) {
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
            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    var access_token = body.access_token;
                    var refresh_token = body.refresh_token;

                    var options = {
                        url: 'https://api.spotify.com/v1/me',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        json: true
                    };
                    console.log("My access token is: " + access_token);
                    console.log("My refresh token is: " + refresh_token);

                    //store tokens in database
                    db.storeAccessToken({"access_token": access_token});
                    db.storeRefreshToken({"refresh_token": refresh_token});
                    res.redirect(200, config.server.path);

                } else { //INVALID redirect
                    res.sendStatus(500);
                }
            });
        }
    });
    
    return router;
}
