/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

var ws = new WebSocket('ws://' + location.host + '/groupcall');
var participants = {};
var name;
var canvas0;
var pointer;
var activeTool = "rect";
var activeColor = "red";
var x1,y1;
// End point (x,y)
var x2,y2;

var meetingID;
var jsonUserData;

var STUN = {
    'url': 'stun:stun.l.google.com:19302',
};

var TURN = {
    url: 'turn:ninefingers@52.24.208.192',
    credential: 'youhavetoberealistic'
};

var iceServers =
{
    iceServers: [STUN, TURN]
};


window.onbeforeunload = function() {
	ws.close();
};

ws.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'existingParticipants':
		onExistingParticipants(parsedMessage);
		break;
	case 'newParticipantArrived':
		onNewParticipant(parsedMessage);
		break;
	case 'participantLeft':
		onParticipantLeft(parsedMessage);
		break;
	case 'receiveVideoAnswer':
		receiveVideoResponse(parsedMessage);
		break;
	case 'iceCandidate':
		participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
	        if (error) {
		      console.error("Error adding candidate: " + error);
		      return;
	        }
	    });
	    break;
	default:
		console.error('Unrecognized message', parsedMessage);
	}
}

function register() {
	name = document.getElementById('name').value;
	meetingID = document.getElementById('roomName').value;

	/*document.getElementById('room-header').innerHTML = '<i style="color: #DFE4ED; font-size: 10px; display:inline-block; padding-bottom: 4px;">Meeting ID</i><br><span class="label label-success" style="font-size: 10px;">'+ meetingID.toUpperCase()+'</span>';
    document.getElementById('room-header').innerHTML = '<span>'+ meetingID.toUpperCase()+'</span>';
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';
    document.getElementById('myCover').style.display = 'block';
    document.getElementById('vertical-nav').style.display = "block";
	var message = {
		id : 'joinRoom',
		name : name,
		room : meetingID,
	}
    initializePlugins(name, meetingID);
	sendMessage(message);
    chgWid();*/
    window.location ="launcher.html?username="+name+"&roomname="+meetingID+"&origin=H2HDev";
}

function autoRegister(userName, roomName) {
	name = userName;
    meetingID = roomName;
    jsonUserData = JSON.parse(window.sessionStorage.getItem('userObject'));

	/*document.getElementById('room-header').innerHTML = '<i style="color: #DFE4ED; font-size: 10px; display:inline-block; padding-bottom: 4px;">Meeting ID</i><br><span class="-success" style="font-size: 10px;"> '+ meetingID.toUpperCase()+'</span>';*/
    document.getElementById('room-header').innerHTML = '<span>'+ meetingID.toUpperCase()+'</span>';
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';
    document.getElementById('myCover').style.display = 'block';
    document.getElementById('vertical-nav').style.display = "block";
	var message = {
		id : 'joinRoom',
		name : userName,
		room : roomName,
	}
	initializePlugins(name, roomName);
	sendMessage(message);
    chgWid();
}

function initializePlugins(userName, roomName){
				var options = {
				        animate: true,
				        vertical_margin: 5,
				        cell_height: 60,
				        width:12,
				        always_show_resize_handle: true,
				        draggable: { handle: ".ui-resizable-handle"}
				    };

				    $('.grid-stack').gridstack(options);
					resetGrid();

				   $(window).resize(function() {
  						var grid = $('.grid-stack').data('gridstack');
  						//var newheight = grid.cell_height() -  
  						//grid.cell_height($(window).height()/6);	
					});

				    $(".ui-resizable-handle").click(function(){
				   	    onClick_GridItem($(this).parent().closest('div'));
				    });


				    $('#aDisplay6Grid').click(function(){
				    	resetGrid();
				    });
					
                    /*
					$('#iFrameWhiteBoard').attr('src','http://52.24.21.199:4000/html5canvas/whiteboard.html?meetingId='+meetingID+'&username='+userName+'&presenter=no');
                    http://52.24.21.199:8090/whiteboard/?joincode=999-999-001&userid=7&presentation=4
                    */
    
                    $('#iFrameWhiteBoard').attr('src','http://52.33.156.147:8090/whiteboard/?joincode=999-999-001&userid=7&presentation=4');

				     $('#iFrameChat').attr('src','http://52.24.111.229:3000/?userName='+ userName+'&roomName='+meetingID);

			        socket_trans = io.connect('54.191.6.228:8090');
			        socket_trans.on('connect', function(){
			          console.log('Connected to Transcript Node Server');
			                console.log('Username: ' +userName+ ' meetingID: ' + meetingID);
			                socket_trans.emit('adduser', userName, meetingID);
                            $("#liToggleMicrophone").attr("data-user-id",userName);
                            $("#liToggleVideo").attr("data-user-id",userName);
			        });

			        socket_trans.on('updatechat', function (username, data) {
			           console.log('Received message from server, username: ' + username + ' message: ' + data);
                        //Updating User list in vertical navigation
                        userList();
                        //Code to change to grid when 6 users --Start--
                        setTimeout(function(){
                            if($(".childDiv").children().length > 4 && $("#participants").children().length > 1){
                                var theMain = $("#participants").children().first().clone()
                                theMain.removeClass("main").appendTo(".childDiv");
                                $(".childDiv").css({position:"absolute", width:"100%", top:"15%", bottom:"10%",left:"0px",right:"0px"});
                                $(".childDiv").children().css({float:"left",width:"31.33333%",height:"40%","pointer-events": "none","margin-bottom":"2%", "margin-right":"2%"});
                                if($("#participants").children().length > 1){
                                    $("#participants").children().first().remove();
                                }
                            }
                            if($(".childDiv").children().length < 6 && $("#participants").children().length == 1){
                                $(".childDiv").children().removeAttr("style");
                                $(".childDiv").removeAttr("style");
                                
                                var Main = $(".childDiv > .customMain").detach();
                                Main.addClass("main");
                                $("#participants").prepend(Main);
                            }
                        },1000);
                        
                        //Code --End--
			           if(username != userName && username != 'SERVER') {
			                $('#final_span').append('<b style="color:green">'+username + ':</b> ' + data + '<br/>');
			           }
			           });



				     $('#divFAQ').tooltipster({
                			autoClose: true,
                			trigger: 'click',
                			position: 'bottom',
                			content: $('<div style="width:auto;height:auto;"><ul><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Cannot hear host?</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Host is speaking too fast?</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">How do I request control for whiteboard?</a></li></ul></div>')
            			});


				      $('#divFeatures').tooltipster({
                			autoClose: true,
                			trigger: 'click',
                			position: 'bottom',
                			content: $('<div style="width:auto;height:auto;"><ul><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Augment Video</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Auto Troubleshoot</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Show Attendees Location</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Enable Recording</a></li><li style="margin-bottom: 10px;"><a style="color: chocolate;cursor: pointer;text-decoration: underline;">Social Media Integration</a></li></ul></div>')
            			});

				       startSpeechRecognition();
}

function onClick_GridItem(gridItem){
    var parentDiv = gridItem;
      var dataid = parentDiv.attr('data-id');
       var grid = $('.grid-stack').data('gridstack');
       el = parentDiv;
       var xpos = parseInt(parentDiv.attr("data-gs-x"));
       var ypos = parseInt(parentDiv.attr('data-gs-y'));
       var elwidth = parseInt(parentDiv.attr("data-gs-width"));
       var elheight = parseInt(parentDiv.attr('data-gs-height'));
        if(elwidth == 8 && elheight == 12){
            grid.update(el, 0, 0, 12, 12);
            if($('div[data-gs-y="24"]').length !=0){
                grid.update($('div[data-gs-y="24"]'), 4, 12, 4, 6);
            }
        }
        else if(elwidth == 12 && elheight == 12){
            resetGrid();
        }
        else{
            var swapelement = $('div[data-gs-height="12"]');
            if(swapelement.length != 0){
                grid.update(swapelement, xpos, ypos, 4, 6);
            }
            else{
                if(xpos == 0){
                    swapelement = $('div[data-gs-x="4"]')[0];
                    grid.update(swapelement, xpos, ypos, 4, 6);
                }
            }
            grid.update(el, 4, 0, 8, 12);
            if($('div[data-gs-y="18"]').length !=0){
                grid.update($('div[data-gs-y="18"]'), 0, 12, 4, 6);
            }
        }
}

function resetGrid(){
     var grid = $('.grid-stack').data('gridstack');
	 var div1 = $('div[data-id="1"]');
     var div2 = $('div[data-id="2"]');
	 var div3 = $('div[data-id="3"]');
	 var div4 = $('div[data-id="4"]');
	 var div5 = $('div[data-id="5"]');
	 var div6 = $('div[data-id="6"]');
    
    
	 grid.update(div1, 0, 0, 4, 6);
	 grid.update(div2, 0, 6, 4, 6);
	 grid.update(div3, 4, 0, 4, 6);
	 grid.update(div4, 4, 6, 4, 6);
	 grid.update(div5, 8, 0, 4, 6);
	 grid.update(div6, 8, 6, 4, 6);
  
}



function onNewParticipant(request) {
	receiveVideo(request.name);
    console.log("On new: "+request.name);
}

function receiveVideoResponse(result) {
	participants[result.name].rtcPeer.processAnswer (result.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error (error);
		});
	}
}

function onExistingParticipants(msg) {
	var constraints = {
		audio : true,
		video : {
			mandatory : {
				//minWidth : 480,
				//maxWidth : 1280,
				maxFrameRate : 60,
				minFrameRate : 30
			}
		}
	};
	console.log(name + " registered in room " + meetingID);
	var participant = new Participant(name);
	participants[name] = participant;
	var video = participant.getVideoElement();

	var options = {
	      localVideo: video,
	      mediaConstraints: constraints,
	      onicecandidate: participant.onIceCandidate.bind(participant),
              iceServers
	    }
	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
		function (error) {
		  if(error) {
			  return console.error(error);
		  }
		  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
	});

	msg.data.forEach(receiveVideo);
}

/*function leaveRoom() {
	sendMessage({
		id : 'leaveRoom'
	});

	for ( var key in participants) {
		participants[key].dispose();
	}

	//document.getElementById('join').style.display = 'block';
	//document.getElementById('room').style.display = 'none';

	ws.close();
	window.location = "http://52.33.31.9/h2h/";

}*/

function leaveRoom() {
    sendMessage({
        id : 'leaveRoom'
    });

    for ( var key in participants) {
        participants[key].dispose();
    }

    //document.getElementById('join').style.display = 'block';
    //document.getElementById('room').style.display = 'none';

    ws.close();
    window.location = "http://54.191.6.228:8082/";

}

function receiveVideo(sender) {
	var participant = new Participant(sender);
	participants[sender] = participant;
	var video = participant.getVideoElement();

	var options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant),
      iceServers
    }

	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			function (error) {
			  if(error) {
				  return console.error(error);
			  }
			  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
	});;
}

function onParticipantLeft(request) {
	console.log('Participant ' + request.name + ' left');
	var participant = participants[request.name];
	participant.dispose();
	delete participants[request.name];
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);
	waitForSocketConnection(ws, function() {
           ws.send(jsonMessage);
        });
}

function waitForSocketConnection(socket, callback){
        setTimeout(
            function(){
                if (socket.readyState === 1) {
                    if(callback !== undefined){
                        callback();
                    }
                    return;
                } else {
                    waitForSocketConnection(socket,callback);
                }
            }, 5);
    };

/**** Burger Menu Toggle****/ 

/***function resetMenu(){
    $("#fullBod").css({"margin-left":"60px"});
    $("nav.navbar.navbar-inverse.navbar-fixed-top").css({"left":"60px"});
    $(".conference-user-control-bar.text-center.ng-isolate-scope").css({"right": "60px"});
}***/
function chgWid(){
    if($("#vertical-nav").hasClass("ver-nav-show")){
        $("#vertical-nav").removeClass("ver-nav-show");
        $("#vertical-nav").css({"width":"60px"});
        $("#fullBod").css({"margin-left":"60px"});
        $("nav.navbar.navbar-inverse.navbar-fixed-top").css({"left":"60px"});
        $(".conference-user-control-bar.text-center.ng-isolate-scope").css({"right": "60px"});
        
        //Checking if #ver-users is open, if open then close
        if($("#ver-users").hasClass("active")){
            $("#ver-users").removeClass("active");
        }
    }else{
        $("#vertical-nav").addClass("ver-nav-show");
        $("#vertical-nav").css({"width":"260px"});
        $("#fullBod").css({"margin-left":"260px"});
        $("nav.navbar.navbar-inverse.navbar-fixed-top").css({"left":"260px"});
        $(".conference-user-control-bar.text-center.ng-isolate-scope").css({"right": "260px"});
    }
    
}
/***************************/

// Add User to vertical-nav
function userList(){
    $("#user-list").empty();
    var mainUser = $(".participant.customMain").attr("id");
        /*mureHTML = "<ul class='list-inline' style='float:right'><li><i class='fa fa-microphone'></i></li><li><i class='fa fa-video-camera'></i></li></div>";*/
    
    $(".participant").each(function(){
        if(this.id !== mainUser){
            $("#user-list").append("<li style='color: #A3E1D4;' title='"+this.id+"'><span style='cursor: default;'>"+this.id+"</span><div style='float:right; margin-top: 4px;'><img src='img/mic-on.svg' data-audio='true' data-user-id='"+this.id+"' style='width:10px; margin-top: -2px;' onclick='onOffVM(this);'><img src='img/video-on.svg' data-video='true' data-user-id='"+this.id+"' style='width:15px; margin-top: -2px; margin-left:7px;' onclick='onOffVM(this);'><img src='img/shareScreen.svg' style='width:15px; margin-top: -2px; margin-left:7px;' /></div>"+"</li>");
        }
    });
    $("#user-list").prepend("<li style='color: #A4CEE8;'><span style='cursor: default;'>You<small> (Host)</small></span><div style='float:right;margin-top: 4px;'><img src='img/mic-on.svg' data-audio='true' data-user-id='"+mainUser+"' style='width:10px; margin-top: -2px;' onclick='onOffVM(this);'><img src='img/video-on.svg' data-video='true' data-user-id='"+mainUser+"' style='width:15px; margin-top: -2px; margin-left:7px;' onclick='onOffVM(this);'><img src='img/shareScreen.svg' style='width:15px; margin-top: -2px; margin-left:7px;' /></div>"+"</li>");
    
    /*
    if ($('#iToggleAudio').attr("onClick") == undefined) {
        $('#iToggleAudio').click(function(e){
            console.log("clicked");
        });
    }*/
   
}
//function which turns off video-audio 
function onOffVM(event){
    var user = $(event).attr("data-user-id");
    
    console.log(participants[user].rtcPeer.audioEnabled);
    console.log(participants[user].rtcPeer.videoEnabled);
    console.log("Clicked"+$(event).attr("data-user-id"));
    
    if($(event).attr("data-audio") !== undefined){
        if ($(event).attr("data-audio") == "true") {
            console.log("Audio True");
            participants[user].rtcPeer.audioEnabled = false;
            $("img[data-user-id ='"+user+"' ][data-audio], li[data-user-id ='"+user+"' ][data-audio]").attr("data-audio",'false');
            $("img[data-user-id ='"+user+"' ][data-audio], li[data-user-id ='"+user+"' ][data-audio] img").attr("src","img/audio-off.svg");
            
            /*
            $("i[data-user-id ='"+$(event).attr("data-user-id")+"' ][data-audio], [data-user-id ='"+$(event).attr("data-user-id")+"' ][data-audio] i").removeClass("fa-microphone").addClass("fa-microphone-slash");
            */
            
        } else {
            console.log("Audio False");
            participants[$(event).attr("data-user-id")].rtcPeer.audioEnabled = true;
            $("img[data-user-id ='"+user+"' ][data-audio], li[data-user-id ='"+user+"' ][data-audio]").attr("data-audio",'true')
            $("img[data-user-id ='"+user+"' ][data-audio], li[data-user-id ='"+user+"' ][data-audio] img").attr("src","img/mic-on.svg")
            /*
            $("i[data-user-id ='"+$(event).attr("data-user-id")+"' ][data-audio], [data-user-id ='"+$(event).attr("data-user-id")+"' ][data-audio] i").removeClass("fa-microphone-slash").addClass("fa-microphone");
            */
        }
    }else{
        if ($(event).attr("data-video") == "true") {
            participants[user].rtcPeer.videoEnabled = false;
            $("img[data-user-id ='"+user+"' ][data-video], li[data-user-id ='"+user+"' ][data-video]").attr("data-video",'false')
            $("img[data-user-id ='"+user+"' ][data-video], li[data-user-id ='"+user+"' ][data-video] img").attr("src","img/video-off-c.svg");
            $("li[data-user-id='"+user+"'][data-video] img").attr("style","width:1.5em; margin: 0px 4px;");
            /*
            $("i[data-user-id ='"+$(event).attr("data-user-id")+"' ][data-video], [data-user-id ='"+$(event).attr("data-user-id")+"' ][data-video] i").removeClass("fa-video-camera").addClass("fa-video-slash");
            */
        } else {
            participants[user].rtcPeer.videoEnabled = true;
            console.log(participants);
            $("img[data-user-id ='"+user+"' ][data-video], li[data-user-id ='"+user+"' ][data-video]").attr("data-video",'true');
            $("img[data-user-id ='"+user+"' ][data-video], li[data-user-id ='"+user+"' ][data-video] img").attr("src","img/video-on.svg");
            $("li[data-user-id='"+user+"'][data-video] img").attr("style","width:1.5em; margin: 4px;");
            /*
            $("i[data-user-id ='"+$(event).attr("data-user-id")+"' ][data-video], [data-user-id ='"+$(event).attr("data-user-id")+"' ][data-video] i").removeClass("fa-video-slash").addClass("fa-video-camera");
            */
        }
    }
}

/***** Search Functionality(START) ****/

//Next-previous handler
function npfunc(obj){
    sid = $(obj).attr("data-sid");
    term = $(obj).attr("data-term");
    vName = $(obj).attr("data-varName");
    cont = $(obj).attr("data-cont");
    funcSelector(sid,term,vName,cont);
}

function funcSelector(s_id,searchTerm){
    if($("[data-id='5']").attr("data-gs-width") == '4' ){
       onClick_GridItem($("[data-id='5']"));
    }
    switch(s_id){
        case "1":
            //Google
            var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyBVywjip23gxM70a8ub9f79WGW5RqJwWCE&cx=006903876709351217801:rwvzpish43w&q="+encodeURIComponent(searchTerm);
            console.log(arguments);
            url += (arguments.length > 2? "&"+arguments[2]+"="+arguments[3]: "");
            googleSearch(searchTerm,s_id,url);
            break;
        case "3":
            //Bing
            var url = "https://api.datamarket.azure.com/Data.ashx/Bing/Search/Web?Query='"+encodeURIComponent(searchTerm)+"'&$top=10&$format=json";
            console.log(arguments);
            url += (arguments.length > 2? "&"+arguments[2]+"="+arguments[3]: "&$skip=0");
            bingSearch(searchTerm,s_id,url);
            break;
        case "5":
            //Wikipedia
            var url = "https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch="+encodeURIComponent(searchTerm)+"&srnamespace=0";
            url += (arguments.length > 2?  "&"+arguments[2]+"="+arguments[3]: "" );
            wikiSearch(searchTerm,s_id,url);
            break;
        case "6":
            //LinkedIn
            var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyBVywjip23gxM70a8ub9f79WGW5RqJwWCE&cx=006903876709351217801:rwvzpish43w&q=linkedin%20"+encodeURIComponent(searchTerm);
            console.log(arguments);
            url += (arguments.length > 2? "&"+arguments[2]+"="+arguments[3]: "");
            googleSearch(searchTerm,s_id,url);
            break;
        case "8":
            //Ebay
            var url = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=HarshalC-f01e-4560-9eea-1c0422538f92&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords="+encodeURIComponent(searchTerm)+"&paginationInput.entriesPerPage=10";
            url += (arguments.length > 2? "&"+arguments[2]+"="+arguments[3]: "");
            ebaySearch(searchTerm,s_id,url);
            break;
    }
}
//Google Search
function googleSearch(sTerm,s_id,url){
    $.ajax({
        //url: "https://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&start=7&q="+encodeURIComponent(sTerm),
        url: url,
        dataType: 'jsonp',
        success: function success(data){
            console.log(data);
            var arr = [];
            if(data.items){
                for(var i=0;i<data.items.length;i++){
                    arr.push({
                        "title": data.items[i].title,
                        "link": data.items[i].link,
                        "description": data.items[i].snippet
                    });
                }
            }
            
            if(data.queries){
                var npLinks = {
                    term: sTerm,
                    sid: s_id,
                    varName: "start",
                    next: (data.queries.nextPage ? data.queries.nextPage[0].startIndex : false),
                    prev: (data.queries.previousPage ? data.queries.previousPage[0].startIndex : false)
                }
            }
            
            showResults(arr,npLinks);
        }
    })
}
//Bing Search
function bingSearch(sTerm,s_id,url){
    $.ajax({
        url: url,
        dataType: 'jsonp',
        password: 'gR2SvQtmcoCDNdCItKJufhy8xgqR4NWsRr6e9SNwi38',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic '+"some"+":"+btoa("gR2SvQtmcoCDNdCItKJufhy8xgqR4NWsRr6e9SNwi38"));
        }
    }).done(function (data){
            var arr = [];
            for(var i=0;i<data.d.results.length;i++){
                arr.push({
                    "title": data.d.results[i].title,
                    "link": data.d.results[i].Url,
                    "description": data.d.results[i].Description
                });
            }
            if(data.d.result.length > 0){
                var urlArr = url.split("="),
                    skip = urlArr[urlArr.length - 1];
                
                var npLinks = {
                    term: sTerm,
                    sid: s_id,
                    varName: "$skip",
                    next: ( data.d._next ? (+skip)+8  : false),
                    prev: (skip > 0? (+skip) - 8 : false)
                }
            }
            
            showResults(arr,npLinks);
        }
    )
}
//Wiki Search
function wikiSearch(sTerm,s_id,url){
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function success(data){
            var arr = [];
            if(data.query && data.query.search){
                for(var i=0;i<data.query.search.length;i++){
                    arr.push({
                        "title": data.query.search[i].title,
                        "link": "https://en.wikipedia.org/wiki/"+encodeURIComponent(data.query.search[i].title),
                        "description": data.query.search[i].snippet
                    });
                }
            }
            console.log(data);
            if(data.continue){
                var npLinks = {
                    term: sTerm,
                    sid: s_id,
                    varName: "sroffset",
                    next: (data.continue.sroffset ? (+data.continue.sroffset) : false),
                    prev: (data.continue.sroffset > 10? (+data.continue.sroffset)-20 : false)
                }
            }
            
            showResults(arr,npLinks);
        }
    })
}
//For EBay ajax call
function ebaySearch(sTerm,s_id,url){
    console.log(s_id);
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function success(data){
            data = data.findItemsByKeywordsResponse[0];
            var arr = [];
            console.log(data);
            if(data.searchResult){
                var _data = data.searchResult[0];
                for(var i=0;i<_data.item.length;i++){
                    arr.push({
                        "title": _data.item[i].title[0],
                        "link": _data.item[i].viewItemURL[0],
                        "description": "Location: "+_data.item[i].location[0]+", "+_data.item[i].country[0]+" | Selling Status: "+_data.item[i].sellingStatus[0].sellingState[0]+" | Price: $ "+_data.item[i].sellingStatus[0].currentPrice[0]["__value__"]
                    });
                }
            }
            if(data.paginationOutput[0].totalPages > 1){
                var pageNumber = data.paginationOutput[0].pageNumber[0],
                totalPages = data.paginationOutput[0].totalPages[0],
                entriesPerPage = data.paginationOutput[0].entriesPerPage[0];

                var npLinks = {
                    term: sTerm,
                    sid: s_id,
                    varName: "&paginationInput.pageNumber",
                    next: (pageNumber != totalPages ? (+(pageNumber)+1) : false),
                    prev: (+pageNumber != 1 ? (+(pageNumber)-1)  : false)
                }
            }
            console.log(npLinks);
            showResults(arr,npLinks);
        }
    })
}
//Show Results
function showResults(resultArr,linksObj){
        //Add the tabbed structure;
        if($("#search-results .container-fluid").length < 1){
            var tabStructure = '<div class="container-fluid">'
                 +'<ul class="nav nav-tabs">'
                 +'<li class="active"><a data-target="#result1" data-toggle="tab">Results</a></li>'
                 +'</ul>'
                 +'<div class="tab-content">'
                 +'<div class="tab-pane fade active in" id="result1">'
                 +'</div><!-- #result1-->'//#result1
                 +'</div><!-- tab content-->'//tab content
                 +'</div><!-- container -->'//container
            $("#search-results").append(tabStructure);
        }
        var el="";
        //Remove old results,if any 
        $("#result1").children().fadeOut(300).remove();
        
        /**** Repeated Content****/
        if(resultArr.length >= 1){
            for(var i=0;i<8;i++){
                el += '<div><h4><a data-link="'+resultArr[i].link+'" onclick="newTab(this)">'+resultArr[i].title+'</a></h4>'
                if(linksObj.sid=="6"){
                    el += '<small><a target="_blank" href="'+resultArr[i].link+'">Open in New Browser Tab ></a></small>'
                }
                el+='<p>'+resultArr[i].description+'</p></div>';
            }
            /** Adding Previous & Next Functionality **/
                el += "<div class='np-buttons'>";
                console.log(linksObj);
                if(typeof linksObj.prev === 'number'){
                    el += "<a data-sid="+linksObj.sid+" data-term="+linksObj.term+" data-varName="+linksObj.varName+" data-cont="+linksObj.prev+" onclick='npfunc(this)'><i class='fa fa-angle-left'></i> Prev</a> -";
                }
                if(typeof linksObj.next === 'number'){
                    el += " <a data-sid="+linksObj.sid+" data-term="+linksObj.term+" data-varName="+linksObj.varName+" data-cont="+linksObj.next+" onclick='npfunc(this)'>Next <i class='fa fa-angle-right'></i></a>";
                }

                el += "</div>"//next-prev div

            /******************************************/
        }else{
            el += '<div><h3>No Results Found</h3><p>Try Another Search Engine? Or try with different keyword?</p></div>';
        }
        /**************************/
        
        $("#result1").append(el).fadeIn(300);
        //Defaulting to results tab
        $("#search-results .tab-content div,#search-results li").removeClass("active in");
        $("#search-results .tab-content div:first-child").addClass("active in")
        $("#search-results li:first-child").addClass("active");
    
}
//Opening New Tab in widget
function newTab(obj){
    var noOfli = $("#search-results ul li").length;
    if(noOfli < 10){
        $("#search-results ul").append("<li><a data-target='#result"+(noOfli+1)+"' data-toggle='tab'>"
                                       +($(obj).text().length > 7 ? $(obj).text().slice(0,5)+".." : $(obj).text())
                                       +"&emsp;<i class='fa fa-times'></i></a></li>");
        $("#search-results .tab-content").append('<div class="tab-pane fade" id="result'+(noOfli+1)+'">'+'<div></div><iframe src="'+$(obj).attr("data-link")+'" class="int-iframe" onerror="console.log(49)"></iframe>'+'</div>')
        //Defaulting to called tab
        $("#search-results .tab-content div,#search-results li").removeClass("active in");
        $("#search-results .tab-content div#result"+(noOfli+1)).addClass("active in")
        $("#search-results a[data-target='#result"+(noOfli+1)+"']").parent().addClass("active");
    }
    return false;
}

/***** Search Functionality(END) ****/