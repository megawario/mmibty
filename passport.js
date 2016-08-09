
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./database');

passport.serializeUser(function(user, done) {
    var nuser = {};
    nuser.email = user.email;
    nuser.password = user.password;
    done(null, nuser);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session:true
    },
    function(username, password, done) {
        db.authUser(username,password,done)
            .then(function(user){
                return done(null,user)})
            .catch(function(err){
                console.debug("passport.js - "+err);
                return done(null,false)});
    }
));

passport.myauth = passport.authenticate('local', {
        successRedirect: 'playlist.html'
    });

module.exports=passport;