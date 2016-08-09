/**
 * @module models
 */

var mongoose = require("mongoose");
/**
 * Global user
 * @Constructor
 * @author mpinto
 */
var UserSchema = new mongoose.Schema({
    "email":{type:String, required:true},
    "username":{type:String, required:true},
    "password":{type:String, required:true}, //stored as SHA1

    // == GLOBAL MUSIC STATS == //
    "song_number": { type: Number, default:0}, //number of songs
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
});

module.exports = mongoose.model("nuser",UserSchema);
