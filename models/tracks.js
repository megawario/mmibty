/**
 * @module models
 */

var mongoose = require("mongoose");
/**
 * Database model for tracks on the playlist.
 *
 * Should store all info needed in order be not necessary to fetch additional info from
 * the spotify api regarding the songs present.
 *
 * Voted deleted tracks are to be blacklisted.
 * User removed tracks can be still added.
 * @Constructor
 * @author mpinto
 */
var TrackSchema =  new mongoose.Schema(
    {
        track_uri:String, //song uri
        user:String,      //user id that added song
        user_name:String,  //user_name that added song

        // == track status ==//
        love_num:Number,
        hate_num:Number,
        love:{type:[String], default:[]},         //list of user_name that loves
        hate:{type:[String], default:[]},         //list of user_name that hates
        deleted:Boolean,    //have been deleted

        // == track characteristics taken from spotify API ==//
        stats:{
            image:{small:String,normal:String,big:String},
            preview:String,
            name:String,
            singer:String,
            singer_url:String,
            album:String,
            danceability: {type: Number, default: 0},
            energy: {type: Number, default: 0},
            key: {type: Number, default: 0},
            loudness: {type: Number, default: 0},
            mode: {type: Number, default: 0},
            speechiness: {type: Number, default: 0},
            acousticness: {type: Number, default: 0},
            instrumentalness: {type: Number, default: 0},
            liveness: {type: Number, default: 0},
            valence: {type: Number, default: 0},
            tempo: {type: Number, default: 0},
            duration_ms: {type: Number, default: 0}
        }

    });

module.exports = mongoose.model("track",TrackSchema);
