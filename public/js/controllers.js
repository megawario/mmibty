angular.module('mmibty.controllers',
	       ['mmibty.services'])

//controller for adventures
    .controller('mmibtyController',function($scope,mmibtyAPI){
	this.isStart = true; //start flag
	this.selectedTab=0;
	this.name="" //name for the page
	this.feels=""//feels sentence;
	this.searchInput="";
	this.searchResultArray=[];
	this.isAdmin=false; //set administrator

	//model for the playlist tracks
	this.playlistTracks={};
	this.playlistTracksArray=[];
	
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
	    this.searchResultArray=[];
	    if(typeof this.searchInput == undefined || this.searchInput == "") return;
	    var search = this.searchInput.replace(" ","+");
	    mmibtyAPI.searchTrack(search)
		.then(
		    (function(response){
			this.searchResultArray.push(response.data);
		    }).bind(this),function(response){alert("error occured while searching")});
	};

	this.keypressSearch = function(keyEvent){
	    if(keyEvent.which == 13) this.searchTrack();
	};

	//fetch the rest of the tracks from the search, pushing the rest to the search array.
	this.getMoreTracks = function(nextUrl){
	    mmibtyAPI.getURL(nextUrl)
		.then(
		    (function(response){
			this.searchResultArray.push(response.data);
		    }).bind(this),function(response){alert("error occured while searching")});
	};


	//fetch and append the playlistTracks
	this.getPlaylistTracks = function(){
	    this.playlistTracksArray=[];
	    mmibtyAPI.getPlaylistTracks().then(
		(function(response){
		    this.playlistTracksArray.push(response.data);
		}).bind(this),function(response){alert("error occured while loading")}
	    );
	};
	
	//fetch and append the rest of the playlist tracks
	this.getMorePlaylistTracks = function(nextUrl){
	        mmibtyAPI.getURL(nextUrl)
		.then(
		    (function(response){
			this.playlistTracksArray.push(response.data);
		    }).bind(this),function(response){alert("error occured while searching")});
	}
	
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
