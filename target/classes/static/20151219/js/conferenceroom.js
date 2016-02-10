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
	var room = document.getElementById('roomName').value;

	document.getElementById('room-header').innerHTML = '<i class="fa fa-users" style="padding-right:10px;"></i><span style="padding-right:10px">H2H Conference Room</span>' + "(" +room.toUpperCase() +")";
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';

	var message = {
		id : 'joinRoom',
		name : name,
		room : room,
	}
    initializePlugins(name, room);
	sendMessage(message);

}

function autoRegister(userName, roomName) {
	name = userName;

	document.getElementById('room-header').innerHTML = '<i class="fa fa-users" style="padding-right:10px;"></i><span style="padding-right:10px">H2H Conference Room</span>' + "(" +roomName.toUpperCase() +")";
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
				        vertical_margin: 10,
				        cell_height: 52,
				        width:12,
				        //cell_height: 70,
				        always_show_resize_handle: true,
				        draggable: { handle: ".ui-resizable-handle"}
				    };

				    $('.grid-stack').gridstack(options);

				   
				    $(".ui-resizable-handle").click(function(){
				   	var parentDiv =  $(this).parent().closest('div');
				      var dataid = parentDiv.attr('data-id');
				       var grid = $('.grid-stack').data('gridstack');
				       el = parentDiv;
				       var xpos = parseInt(parentDiv.attr("data-gs-x"));
				       var ypos = parseInt(parentDiv.attr('data-gs-y'));

				      if(dataid != 3){
				       grid.update(el, 4, 0, 8, 12);
				       var swapelement = $('div[data-id="3"]');
				       grid.update(swapelement, xpos, ypos, 4, 6);
				       swapelement.attr("data-id", dataid);
				       parentDiv.attr("data-id","3");
				     }
				     else{
				     	if(xpos == 0){
 							grid.update(el, 4, 0, 8, 12);
				     	}
				     	else{
				     		grid.update(el, 0, 0, 12, 12);
				     	}						
				     }
				    });
					
				  
					//var toolkit1 = '<div><ul class="nav navbar-nav toolbox"><li id="rect" class="tool activeTool"><i class="fa fa-stop fa-fw fa-2x"></i></li><li id="circle" class="tool"><i class="fa fa-circle fa-fw fa-2x"></i></li><li id="triangle" class="tool"><i class="fa fa-exclamation-triangle fa-fw fa-2x"></i></li><li id="text" class="tool"><i class="fa fa-font fa-fw fa-2x"></i></li><li id="pencil" class="tool"><i class="fa fa-pencil fa-fw fa-2x"></i></li><li id="pointer" class="tool"><i class="fa fa-mouse-pointer fa-fw fa-2x"></i> </li></ul></div>';
					//$('.owl-buttons').prepend("<div style='margin-bottom: -11px;'><ul class='nav navbar-nav toolbox'><li id='rect' class='tool activeTool'><i class='fa fa-stop fa-fw fa-2x'></i></li><li id='circle' class='tool'><i class='fa fa-circle fa-fw fa-2x'></i></li><li id='triangle' class='tool'><i class='fa fa-exclamation-triangle fa-fw fa-2x'></i></li><li id='text' class='tool'><i class='fa fa-font fa-fw fa-2x'></i></li><li id='pencil' class='tool'><i class='fa fa-pencil fa-fw fa-2x'></i></li><li id='pointer' class='tool'><i class='fa fa-mouse-pointer fa-fw fa-2x'></i> </li></ul></div>");
					
					$('#iFrameWhiteBoard').attr('src','http://52.24.21.199:4000/html5canvas/whiteboard.html?meetingId='+room+'&username='+userName+'&presenter=no');

				     $('#iFrameChat').attr('src','http://52.24.111.229:3000/?userName='+ userName);


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
	console.log(name + " registered in room " + room);
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
