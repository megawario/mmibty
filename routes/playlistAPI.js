module.exports = function (express, config, utils, db) {

    var router = express.Router();
    var bodyParser = require("body-parser");
    var request = require("request");
    var log = utils.log;
    var ipv4 = utils.ipv4;

    //allways log access
    router.use(function logRequest(req, res, next) {
        log.info('request from ' + ipv4(req.ip) + ' to ' + req.path);
        next();
    });

    //allways authorize remote address & user access
    router.use(function (req, res, next) {
        var remote = ipv4(req.connection.remoteAddress);
        log.debug("Checking auth for " + remote + "with config.auth: " + config.auth[remote]);
        if (config.auth[remote] === "undefined") {
            res.sendStatus(403); //TODO redirect to forbidden page
        } else {
            //TODO check if user exists - returns 403 if not.
            next();
        }
    });

    router.use(bodyParser.json());

    // ============================================================= USER =================================================================================== //

    //gets user stats and info
    router.get('/user/stats', function (req, res) {
        var remote = ipv4(req.connection.remoteAddress);
        db.getTrackInfo(remote, function (err, doc) {
            if (err) res.sendStatus(500);
            else res.json(doc);
        })
    });

    //get name associated with the machine
    router.get('/user/name/', function (req, res) {
        var remote = ipv4(req.connection.remoteAddress);
        if (remote !== "undefined") res.json({name: config.auth[remote]});
        else res.sendStatus(500); //server Error
    });

    //checks if user is admin
    router.get('/user/admin/', function (req, res) {
        var remote = ipv4(req.connection.remoteAddress);
        if (remote !== "undefined" && remote === config.master) res.sendStatus(200); //OK
        else res.sendStatus(403); //not auth
    });

    // =============================================================================== PLAYLIST ============================================================= //

    router.get('/playlist/status', function (req, res) {
        db.getPlaylistStats();
    });

    /**
     * Playlist route to fetch tracks that exist on our playlist.
     * Truth is database, so it will fetch from database knowledge the information and send to client
     * //TODO support incremental sending of information on the request using an offset
     * //the offset should go as part of the get query string
     * //for 1000 songs returning mutch information in one go is infesible.
     */
    router.get('/playlist/', function (req, res) {
        db.getPlaylistTracks(null,null,function(err,doc){
            if(err) return res.sendStatus(500); //TODO change error code
            return res.status(200).send(doc);
            
        });

    });

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
    router.post('/playlist/track/add', function (req, res) {
        log.debug("track to add: " + req.body.track_uri + " by user: " + req.connection.remoteAddress);
        var track_uri = req.body.track_uri;
        var user = ipv4(req.connection.remoteAddress);
        var user_name = config.auth[user];
        //1 - check on db if exists
        db.trackExists(null, track_uri, function (err) {
                if (err) return res.status(500).json({error: "Cannot add existing track - it allready exists"});
                else {
                    this.spotAddTrack(err, track_uri, function (err) {      				//2 - add to playlist
                            this.spotGetTrackInfo(err, track_uri, function (err, jsonData) {	//3 - get track info
                                    jsonData.user = user;
                                    jsonData.user_name = user_name;
                                    db.addTrack(err, jsonData, function (err) { 					//4 - add track info
                                        if (err) {
                                            //5 - remove track from playlist - clean error to allow removing the track
                                            this.spotRemoveTrack(null, track_uri, function (error) {
                                                if (error) {
                                                    //6 - remove manualy - log critital error and return generic mesage to user
                                                    log.err("ERROR - MANUAL - Please remove " + track_uri + " from playlist manualy.");
                                                    err = error;
                                                }

                                                //7 - could not add song (end of callback error chain)
                                                log.debug("Failed to add song due to: " + err);
                                                return res.status(500).json({
                                                    error: "Cannot add track we are very sorry :(",
                                                    message: err
                                                });

                                            });
                                        }
                                        else { //8 - Everything went OK
                                            return res.sendStatus(201); //created
                                        }
                                    })
                                }
                            )
                        }
                    )
                }
            }
        )
    });

// ===================================== SPOTYFY API REQUESTS================================================== //

    /**
     * Add track to spotify defined playlist
     * 1 - fetch authHeader
     * 2 - make post to spotify API
     *
     * Masks errors to pinpoint where it failed in this process.
     * @param track_uri uri for the spotify track
     * @param callback callback will receive only error
     */
    this.spotAddTrack = function (err, track_uri, callback) { //TODO check why adding is not working
        if (err) return callback(err);
        var url = "https://api.spotify.com/v1/users/" +
            config.spot.userid + "/playlists/" +
            config.spot.playlist + "/tracks?uris=" + track_uri;

        // 1 - fetch auth
        db.getAuthHeader(err, url, function (err, header) {
            if (err) return callback("Could not add track to spotify");

            // 2 - make post
            request.post(header, function (error, response, body) {
                if (error || response.statusCode != 201) return callback("Could not add track to spotify");
                return callback(error); //no error pass on;
            });

        });
    };

    /**
     * Removes track for the playlist
     * @param err
     * @param track_uri
     * @param callback
     */
    this.spotRemoveTrack = function (err, track_uri, callback) {
        if (err) return callback(err);

        var url = "https://api.spotify.com/v1/users/" +
            config.spot.userid + "/playlists/" +
            config.spot.playlist + "/tracks?uris=" + track_uri;

        // 1 - fetch auth
        db.getAuthHeader(err, url, function (err, header) {
            if (err) return callback("Could not remove track from spotify");

            //add info to delete on header structure
            header.body = {"tracks": [{"uri": track_uri}]};

            // 2 - make post
            request.delete(header, function (error, response, body) {
                if (error || response.statusCode != 200) return callback("Could not remove track from spotify");
                return callback(error); //is error;
            });
        });
    };

    /**
     * Returns all the required track info need to add to database
     * 1 - fetch audio features
     * 2 - fetch track information
     *
     * The result is given in a json with 2 properties:
     *  - track_features - containing track features
     *  - track_info - containing track information
     * @param error
     * @param track_uri
     * @param callback err and jsonWith data encapsulating all info, where track info is on track_info and features in track_features
     */
    this.spotGetTrackInfo = function (err, track_uri, callback) {
        if (err) return callback(err);
        //add to user info statistics
        var track_id = track_uri.replace("spotify:track:", "");
        var url =  "https://api.spotify.com/v1/audio-features/" + track_uri.replace("spotify:track:", "");
        var result={};
        db.getAuthHeader(err, url, function (err, header) {

            // 1 - fetch audio features
            request.get(header, function (error, response, body) {
                if (error || response.statusCode != 200) return callback("Failed fetch song information");
                else {
                    console.log(body);
                    result.track_features=body;

                    // 2 - fetch track information
                    header.url = "https://api.spotify.com/v1/tracks/"+track_id;
                    request.get(header,function(error,response,body){
                        if(error || response.statusCode != 200) return callback("Failed fetch song information");
                        else{
                            result.track_info = body;
                            return callback(error,result);
                        }
                    });
                }
            });
        });
    };


// ===================================== AUTH ================================================================= //
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
