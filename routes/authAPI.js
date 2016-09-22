"use strict";

var request = require("request");
var config = require("../config");
var utils = require("../utils");
var db = require("../database");
var passport = require("../passport");

var log = utils.log;
var ipv4 = utils.ipv4;

function login (req,res){
    console.log(JSON.stringify(req));
//    res.redirect("playlist.html");
}


//can append to a provided router or create a new.
module.exports = function (router) {
    if(router == undefined){ router = require("express").Router(); }

    var bodyParser = require("body-parser");

    //allways log access
    router.use(function logRequest(req, res, next) {
        log.info('request from ' + ipv4(req.ip) + ' to ' + req.path);
        next();
    });

    //allways authorize remote address & user access
    router.use(function (req, res, next) {
        var remote = ipv4(req.connection.remoteAddress);
        log.debug("Access from: " + remote);
        next();
    });

    router.use(bodyParser.json());
    router.use(passport.initialize());
    router.use(passport.session());

    router.post('/login',passport.myauth);
    
    return router;
}
