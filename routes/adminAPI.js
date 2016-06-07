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
        log.debug("Checking auth for "+remote +" with config.auth: "+config.auth[remote]);
        if(config.master != remote){
            res.sendStatus(403); //TODO redirect to forbidden page
        }else{
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
            if(err) res.send(500).json(err); //TODO fix html status code
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
    
    return router;
}
