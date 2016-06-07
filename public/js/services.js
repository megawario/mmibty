angular.module('mmibty.services',[])
    .factory('mmibtyAPI',function($http){
	var result={};

	//TODO change this to a server request in order to fetch using the token.
	//get data on music
	result.searchTrack = function(data){
	    var my_url = "https://api.spotify.com/v1/search?q="+data+"&type=track";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

		//======= admin services =======//

		result.adminCreateUser=function(userID,userName){
			return $http({
				method: 'POST',
				url: "admin/createuser",
				data:{"userID":userID,"userName":userName}
			});
		};
		
		result.adminRemoveUser=function(userID){
			return $http({
				method: 'POST',
				url: "admin/removeuser",
				data:{"userID":userID}
			});
		};

		result.adminGetUsers=function(){
			return $http({
				method: 'GET',
				url: "admin/users"
			});
		};
		
	//check if user is admin
	result.isAdmin = function(){
	    var my_url = "rest/user/admin/";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	result.login = function(){
	    var my_url = "rest/login";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	}

	//get user name associated with machine
	result.getName = function(){
	    var my_url = "rest/user/name/";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	//when a user loves a track
	result.setLove = function(uri){
	    var my_url = "rest/user/love";
	    return $http({
		method: 'POST',
		url: my_url,
		data:{"track_uri":uri}
	    });
	};

	//when a user hates a track
	result.setHate = function(uri){
	    var my_url = "rest/user/hate";
	    return $http({
		method: 'POST',
		url: my_url,
		data:{"track_uri":uri}
	    });
	};

	//get user trackstatistics and info
	result.getUserStats = function(){
	    var my_url = "rest/user/stats";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	

	//get playlist tracks
	result.getPlaylistTracks = function(){
	    var my_url = "rest/playlist/";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	//add tracks to playlist
	result.addTrack = function(payload){
	    var my_url = "rest/playlist/track/add";
	    return $http({
		method: 'POST',
		url: my_url,
		data: payload
	    });
	};

	//gets generic URL
	result.getURL = function(url){
	    var my_url = url;
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	
	return result;
    });
