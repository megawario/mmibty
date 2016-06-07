/**
 * Created by mpinto on 07/06/16.
 * Users model for database
 */

module.exports = mongoose.model("user",
    new mongoose.Schema({
        "user":String, 
        "user_name":String,
        "song_number": { type: Number, default:0}, //number of songs
        
        // == stats for musics == //
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
}));
