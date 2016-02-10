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

const PARTICIPANT_MAIN_CLASS = 'participant main module customMain';
const PARTICIPANT_CLASS = 'participant module customParticipant';


/**
 * Creates a video element for a new participant
 *
 * @param {String} name - the name of the new participant, to be used as tag
 *                        name of the video element.
 *                        The tag of the new element will be 'video<name>'
 * @return
 */
function Participant(name) {
	this.name = name;
	var container = document.createElement('div');
	container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	container.id = name;
	
	var header = document.createElement('header');
	var h1 = document.createElement('h1');
	var video = document.createElement('video');
	var rtcPeer;

	container.appendChild(video);
	container.appendChild(header);
	header.appendChild(h1);
	container.onclick = switchContainerClass;

		var childDiv;
		var appendChidDiv;
		if(isPresentMainParticipant()){
			if ($(".childDiv")[0]){
				childDiv = $(".childDiv")[0];
			} else {
				childDiv = document.createElement('div');
				childDiv.className = "childDiv";
				childDiv.appendChild(container);
				
			}
			childDiv.appendChild(container);
			var appendChidDiv = true; 
		}


if(childDiv!=null){
	document.getElementById('participants').appendChild(childDiv);
}
else{
	document.getElementById('participants').appendChild(container);
}
		

	h1.appendChild(document.createTextNode(name));

	video.id = 'video-' + name;
	video.autoplay = true;
	video.controls = false;
       // video.width = 1280;
        //video.width = 640;

	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	function switchContainerClass() {
		if (container.className === PARTICIPANT_CLASS) 
		{
			var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
				elements.forEach(function(item) {
					 //$(item).detach();
					// $(item).appendTo(".childDiv");
					// $(item).detach();
					 $(item).appendTo(".childDiv");
					 if($(item)[0]){
					 	$(item)[0].children[0].play();
					 }
					 //$(item)[0].play();
					item.className = PARTICIPANT_CLASS;
				});

				//$(container).detach(".childDiv");
				//$(container).appendTo("#participants");
				//$(container).detach(".childDiv");
				$(container).appendTo("#participants");
				if($(container)[0]){
					 	$(container)[0].children[0].play();
					 }
				container.className = PARTICIPANT_MAIN_CLASS;

		} 
		else 
		{
			//Comes here if the click is on main video - Do Nothing
			//container.className = PARTICIPANT_CLASS;
		}
	}

	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		console.log('Invoking SDP offer callback function');
		var msg =  { id : "receiveVideoFrom",
				sender : name,
				sdpOffer : offerSdp
			};
		sendMessage(msg);
	}


	this.onIceCandidate = function (candidate, wp) {
		  console.log("Local candidate" + JSON.stringify(candidate));

		  var message = {
		    id: 'onIceCandidate',
		    candidate: candidate,
		    name: name
		  };
		  sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {
		console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();
		container.parentNode.removeChild(container);
	};
}
