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

	document.getElementById('room-header').innerHTML = '<span style="padding-right:10px">Meeting ID: </span>'+ meetingID.toUpperCase();
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';

	var message = {
		id : 'joinRoom',
		name : name,
		room : meetingID,
	}
    initializePlugins(name, meetingID);
	sendMessage(message);

}

function autoRegister(userName, roomName) {
	name = userName;
        meetingID = roomName;

	document.getElementById('room-header').innerHTML = '<span style="padding-right:10px">Meeting ID: </span>'+ roomName.toUpperCase();
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';

	var message = {
		id : 'joinRoom',
		name : userName,
		room : roomName,
	}
	initializePlugins(name, roomName);
	sendMessage(message);
}

function initializePlugins(userName, roomName){
				var options = {
				        animate: true,
				        vertical_margin: 5,
				        cell_height: 50,
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
				   	var parentDiv =  $(this).parent().closest('div');
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
				    });


				    $('#aDisplay6Grid').click(function(){
				    	resetGrid();
				    });
					

					$('#iFrameWhiteBoard').attr('src','http://52.24.21.199:4000/html5canvas/whiteboard.html?meetingId='+meetingID+'&username='+userName+'&presenter=no');

				     $('#iFrameChat').attr('src','http://52.24.111.229:3000/?userName='+ userName+'&roomName='+meetingID);

			        socket_trans = io.connect('54.191.6.228:8090');
			        socket_trans.on('connect', function(){
			          console.log('Connected to Transcript Node Server');
			                console.log('Username: ' +userName+ ' meetingID: ' + meetingID);
			                socket_trans.emit('adduser', userName, meetingID);
			        });

			        socket_trans.on('updatechat', function (username, data) {
			           console.log('Received message from server, username: ' + username + ' message: ' + data);
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
	window.location = "http://52.33.31.9/h2h/";

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
