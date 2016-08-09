var request = require("request");
var config = require("../config");
var utils = require("../utils");
var log = utils.log;
var ipv4 = utils.ipv4;
var db = require("../database");
var spotifyApi = require("../spotifyAPI");

/**
 *
 * Playlist route to fetch tracks that exist on our playlist.
 * Truth is database, so it will fetch from database knowledge the information and send to client
 * //TODO support incremental sending of information on the request using an offset
 * //the offset should go as part of the get query string
 * //for 1000 songs returning mutch information in one go is infesible.
 *
 * @param req
 * @param res
 */
function getPlaylist(req, res) {
    db.getPlaylistTracks(null,null,function(err,doc){
        if(err) return res.sendStatus(500); //TODO change error code
        return res.status(200).send(doc);

    })};

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
 * @param req
 * @param res
 */
function addTrack(req, res) {
    log.debug("track to add: " + req.body.track_uri + " by user: " + req.connection.remoteAddress);
    var track_uri = req.body.track_uri;
    var user = ipv4(req.connection.remoteAddress);
    var user_name = req.user_name;
    //1 - check on db if exists
    db.trackExists(null, track_uri, function (err) {
            if (err) return res.status(500).json({error: "Cannot add existing track - it allready exists"});
            else {
                spotifyApi.spotAddTrack(err, track_uri, function (err) {      				    //2 - add to playlist
                        spotifyApi.spotGetTrackInfo(err, track_uri, function (err, jsonData) {	//3 - get track info
                                if(typeof jsonData!="undefined"){
                                    jsonData.user = user;
                                    jsonData.user_name = user_name;
                                }
                                db.addTrack(err, jsonData, function (err) { 					//4 - add track info
                                    if (err) {
                                        //5 - remove track from playlist - clean error to allow removing the track
                                        spotifyApi.spotRemoveTrack(null, track_uri, function (error) {
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
};

/**
 * Remove track from playlist
 * 1 - remove track from spotify
 * 2 - remove track from database
 * 3 - recalculate statistics
 *
 * //TODO shouls restrict this delete to owner of the music.
 * @param req
 * @param res
 */
function removeTrack(req,res){
    var user = ipv4(req.connection.remoteAddress);
    var track_uri = req.query.track_uri;
    db.getTrack(null,track_uri,function(err,track){
        //check if user is authorized to remove track.
        //restrict to user but allow admin to delete any music.
        if((err || track.user!=user || typeof track=="undefined") && config.master!=user ) return res.sendStatus(403);

        spotifyApi.spotRemoveTrack(null, track_uri, function(err){
            db.removeTrack(err,track_uri,function(err){
                if(err) return res.status(500).json({error:"Could not delete track",debug:err});
                else {
                    //recalculation can fail, we dont care
                    db.recalculateUserStats(err,user,req.user_name,function(err){
                        if(err) log.warning("failed recalculating stats "+err)});
                    return res.sendStatus(200);
                }
            });
        })
    });
}

module.exports = function (router) {
    var bodyParser = require("body-parser");


    if(router == undefined){ router = require("express").Router(); }

    router.use(function logRequest(req, res, next) {
        log.info('request from ' + ipv4(req.ip) + ' to ' + req.path);
        next();
    });
    //allways authorize remote address & user access
    router.use(function (req, res, next) {
        var remote = ipv4(req.connection.remoteAddress);
        log.debug("Access from: " + remote);
        // adminCheckUserAuth(remote,function(err,doc){
        //     if(err) return res.sendStatus(403);
        //     req.user_name = doc.user_name;
        //     log.debug("authenticated as " + remote + " with name: " + req.user_name);
        //     next();
        // });
        next();
    });

    router.use(bodyParser.json());

    router.get('/playlist/',getPlaylist);
    router.get('/playlist/status', function (req, res) {
        db.getPlaylistStats();
    });
    router.post('/playlist/track/add', addTrack);
    router.delete('/playlist/track/remove',removeTrack);
    
    return router;
}
