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

	//searches for song music use this.search to find it
	this.searchTrack = function(){
	    var search = this.searchInput.replace(" ","+");
	    mmibtyAPI.searchTrack(search)
		.then(
		    (function(response){
		    this.searchResult=response.data;
		    }).bind(this),function(response){alert("error occured while searching")});
	}


	mmibtyAPI.getPlaylistTracks().then(
	    (function(response){
		this.playlistTracks = response.data;
	    }).bind(this),function(response){alert("error occured while loading")}
	);

	//get name of machine:
	mmibtyAPI.getName().then((function(response){
	    this.name=response.data.name;
	}).bind(this));

	//sets admin mode for view:
	mmibtyAPI.isAdmin().then((function(response){
	    this.isAdmin=true;
	}).bind(this));
	

    });
