/**
 * Paths responsible for the usage of user API.
 * Receives a route form expressjs and sets the API path.
 * @module userApi
 * @author mpinto
 * @requires module:utils
 * @requires module:database
 */

"use strict";

var request = require("request");
var config = require("../config");
var utils = require("../utils");
var db = require("../database");
var recapcha = require("../recapchaAPI");

var log = utils.log;
var ipv4 = utils.ipv4;

/**
 * Fetch user status
 * @param req
 * @param res
 */
function userStats(req,res){
    var remote = ipv4(req.connection.remoteAddress);
    db.getTrackInfo(remote, function (err, doc) {
        if (err) res.sendStatus(500);
        else res.json(doc);
    })
};

/**
 * Get name associated with the machine
 * @param req
 * @param res
 */
function userName(req, res) {
    var remote = ipv4(req.connection.remoteAddress);
    if (remote !== "undefined") res.json({name: req.user_name});
    else res.sendStatus(500); //server Error
};

/**
 * set user love song
 *
 * Add song to user love list
 * 1 - update song info with user love
 * 2 - check if song must be removed according to remove algorithm
 *
 * This will work as toggle. If name allready exists in the love array, it will remove.
 * Returns 200 if OK 500 if error;
 * @param req
 * @param res
 */
function userLove(req,res){
    console.log("PUT LOVE on " + req.body.track_uri);
    //update song love array
    db.trackToggleLove(null, req.body.track_uri, req.user_name, function (err) {
        if (err) return res.status(500).json({error: "Could not set/unset love"});
        else {
            return res.sendStatus(200);
        };
    });
}

/**
 * set user hate song
 * @param req
 * @param res
 */
function userHate(req, res) {
    //update song love array
    db.trackToggleHate(null, req.body.track_uri, req.user_name, function (err) {
        if (err) return res.status(500).json({error: "Could not set/unset hate"});
        else {
            return res.sendStatus(200);
        };
    });
};

/**
 * Creates a new user on the system.
 * @param req
 * @param res
 * //TODO perform email and userName validation
 * //TODO create user
 * //TODO define return error in order to understand where it failed
 */
function createUser(req,res){
    var user = req.body;
    var ip = req.ip;

    //validate user
    if(!validateUser(user)) {
        return res.sendStatus(400);
    }

    recapcha.verify(config.recapcha.secret,user.capcha,ip)
        .then(function(){return db.createUser(user)})
        .then(function(){ res.sendStatus(201);})
        .catch(function(err){
            res.sendStatus(400)});
};


//can append to a provided router or create a new.
module.exports = function (router) {
    if(router == undefined){ router = require("express").Router(); }

    var bodyParser = require("body-parser");

    //allways log access
    router.use(function logRequest(req, res, next) {
        log.info('request from ' + ipv4(req.ip) + ' to ' + req.path);
        next();
    });
    router.use(bodyParser.json());

    router.get('/user/stats', userStats);
    router.get('/user/name/',userName);
    router.put('/user/love',userLove);
    router.put('/user/hate',userHate);

    router.post('/user/:username',createUser);
    router.get('/authtest',function(req,res){console.log(req.user)});

   return router;
}

// ========= UTILs =======//

function validateUser(user){
    return (user.email && user.username && user.password);
    //TODO check other constrains on the fields
}
