angular.module('mmibty.controllers',
	       ['mmibty.services'])

//controller for adventures
    .controller('mmibtyController',function($scope,mmibtyAPI){
	this.isStart = true; //start flag
	this.selectedTab=0;
	this.name="" //name for the page
	this.searchInput="";
	this.searchResult="";
	this.isAdmin=false; //set administrator

	//model for the playlist tracks
	this.playlistTracks={};
	
	//removes go function
	this.go = function(){
	    if(this.name != ""){
		this.isStart=false;
	    }
	}

	//selects witch tab
	this.selected = function(index){
	    return this.selectedTab===index;
	}

	//add track
	this.addTrack = function(track){
	    var payload = {track_uri:track}
	    mmibtyAPI.addTrack(payload).then(
		(function(response){
		    if(response.status==200){
			this.getPlaylistTracks(); //refresh playlist
			//TODO do something with the response if needed.
		    }
		    else{alert("problem occured when adding music");}
		}).bind(this)
	    )};

	//searches for song music use this.search to find it
	this.searchTrack = function(){
	    var search = this.searchInput.replace(" ","+");
	    mmibtyAPI.searchTrack(search)
		.then(
		    (function(response){
		    this.searchResult=response.data;
		    }).bind(this),function(response){alert("error occured while searching")});
	}


	this.getPlaylistTracks = function(){
	    mmibtyAPI.getPlaylistTracks().then(
		(function(response){
		    this.playlistTracks = response.data;
		}).bind(this),function(response){alert("error occured while loading")}
	    );
	};
	
	this.getPlaylistTracks();

	
	//get name of machine:
	mmibtyAPI.getName().then((function(response){
	    this.name=response.data.name;
	}).bind(this));

	//sets admin mode for view:
	mmibtyAPI.isAdmin().then((function(response){
	    this.isAdmin=true;
	}).bind(this));
	

    });
