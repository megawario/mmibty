/**
 * @module spotifyAPI
 */

var db = require("./database");
var config = require("./config");
var request = require("request");

/**
 * Add track to spotify defined playlist
 * 1 - fetch authHeader
 * 2 - make post to spotify API
 *
 * Masks errors to pinpoint where it failed in this process.
 * @param track_uri uri for the spotify track
 * @param callback callback will receive only error
 */
function spotAddTrack(err, track_uri, callback) { //TODO check why adding is not working
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
 * @param callback (err)
 */
function spotRemoveTrack(err, track_uri, callback) {
    if (err) return callback(err);

    var url = "https://api.spotify.com/v1/users/" +
        config.spot.userid + "/playlists/" +
        config.spot.playlist + "/tracks?uris=" + track_uri;

    // 1 - fetch auth
    db.getAuthHeader(err, url, function (err, header) {
        if (err) return callback("Could not remove track from spotify");

        //add info to delete on header structure
        header.body = {"tracks": [{"uri": track_uri}]};

        // 2 - make delete
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
function spotGetTrackInfo(err, track_uri, callback) {
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

module.exports = {
    spotRemoveTrack : spotRemoveTrack,
    spotGetTrackInfo : spotGetTrackInfo,
    spotAddTrack : spotAddTrack
}