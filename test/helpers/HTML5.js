(function () {

  /** UDPSocket **/
  function FakeUDPSocket(server, protocol) {
    this.readyState = 0; // CONNECTING
    var that = this;
    spyOn(this, 'send');
    setTimeout(function () {
      that.readyState = 1; // OPEN
      if (that.onopen) {
        that.onopen();
      }
    }, 0);
  }
  FakeUDPSocket.prototype = {
    send: function() {},
    close: function () {
      var that = this;
      setTimeout(function () {
        that.readyState = 3; // CLOSED
        if (that.onclose) that.onclose({code:3});
      }, 0);
    },

    // Useful testing functions
    receiveMessage: function (msg) {
      if (this.onmessage) this.onmessage({data: msg});
    },
    causeError: function (e) {
      if (this.onerror) this.onerror(e);
    }
  };
  FakeUDPSocket.CONNECTING = 0;
  FakeUDPSocket.OPEN = 1;
  FakeUDPSocket.CLOSED = 3;
  FakeUDPSocket.orig = window.UDPSocket;
  window.UDPSocket = FakeUDPSocket;


  /** WebRTC **/
  function getUserMedia(constraints, success, failure) {
    if (getUserMedia.fail) {
      setTimeout(failure, 0);
    } else {
      setTimeout(success.bind(null, getUserMedia.fakeStream()), 0);
    }
  }
  getUserMedia.fakeStream = function () {
    var audioTracks = [{
      id: Math.random().toString(),
      stop: jasmine.createSpy('stop'),
    }];
    var videoTracks = [];
    return {
      getAudioTracks: function () {
        return audioTracks;
      },
      getTracks: function () {
        return audioTracks.concat(videoTracks);
      },
      getVideoTracks: function () {
        return videoTracks;
      },
    };
  };
  getUserMedia.orig = window.navigator.getUserMedia;
  window.navigator.getUserMedia = getUserMedia;

  function RTCPeerConnection(options, constraints) {}
  RTCPeerConnection.prototype = {
    iceGatheringState: 'complete',
    iceConnectionState: 'connected',
    createOffer: function createOffer(success, failure) {
      if (createOffer.fail) {
        failure();
      } else {
        setTimeout(function () {
          success({
            type: 'offer',
            body: '',
            sdp: 'HelloOffer'
          });
        }, 0);
      }
    },
    createAnswer: function createAnswer(success, failure) {
      if (createAnswer.fail) {
        failure();
      } else {
        setTimeout(function () {
          success({
            type: 'answer',
            body: '',
            sdp: 'HelloAnswer'
          });
        }, 0);
      }
    },
    setLocalDescription: function setLocalDescription(desc, success, failure) {
      if (setLocalDescription.fail) {
        failure();
      } else {
        this.localDescription = desc;
        setTimeout(function () {
          success();
        }, 0);
      }
    },
    setRemoteDescription: function setRemoteDescription(desc, success, failure) {
      if (setRemoteDescription.fail) {
        failure();
      } else {
        this.remoteDescription = desc;
        setTimeout(function () {
          success();
        }, 0);
      }
    },
    addStream: jasmine.createSpy('addStream').and.callFake(function () {}),
    close: function () {},
    signalingState: function () {}
  };
  RTCPeerConnection.orig = window.RTCPeerConnection;
  window.RTCPeerConnection = RTCPeerConnection;

  function RTCSessionDescription(options) {
    return {
      type: options && options.type,
      body: options && options.body
    };
  }
  RTCSessionDescription.orig = window.RTCSessionDescription;
  window.RTCSessionDescription = RTCSessionDescription;
})();
