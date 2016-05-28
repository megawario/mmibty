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

	result.getURL = function(url){
	    var my_url = url;
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	result.getName = function(){
	    var my_url = "rest/name/";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};

	result.isAdmin = function(){
	    var my_url = "rest/admin/";
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
	
	return result;
    });
