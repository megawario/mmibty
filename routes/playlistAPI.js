module.exports = function(express,config,log){
    var router = express.Router();
    var bodyParser= require("body-parser");

    router.use(function logRequest(req,res,next){
	log.info('request from '+req.ip+' to '+req.path);
	next();
    });

    router.use(bodyParser.json());

    //Post Request
  /*  router.post('/adventure/edit',function(req,res){
	var userID = undefined;
	if(req.isAuthenticated()){userID=req.session.passport.user;} //push userID if logged in.
	db.editAdventure(req.body._id,userID,req.body,function(err,doc){
	    if(err){
		log.err(err);
		err.message==='forbiden' ? res.sendStatus(401) : res.sendStatus(500); //send error status
	    }else{res.status(200).json(doc);} //send document
	});
    });
*/
    
    //GET
    //wrap access arround spotify api
/*    router.get('/playlist/',function(req,res){
         https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
	db.getAdventure(req.params.date,function(err,docs){
	    if(err){
		log.err(err);
		res.sendStatus(500);
	    }else{
		log.debug(JSON.stringify(docs));
		res.json(docs);
	    }
	});
    });
*/
    return router;
}
