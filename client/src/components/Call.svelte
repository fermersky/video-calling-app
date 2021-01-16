<script>
  import { mediaStreamErrorMsg } from './../services/media-stream-error-message.js';
  import Spinner from './Spinner.svelte';
  import { generateConstraintsObject, getUserMedia, getDisplayMedia } from './../services/media-devices.js';
  import { criticalErrorSubject, deviceSelectorPopupSubject } from './../stores.js';
  import { onDestroy, onMount } from 'svelte';
  import { fetchDevices } from '../services/local-storage.js';
  import { iceServers } from '../ice-servers';
  import { emit, on } from '../services/socket.service.js';
  import { rtcError, rtcLog } from '../services/logger.js';
  import { isMobile } from '../services/is-mobile.js';

  export let uid;
  export let participantUid;
  export let username;
  export let initiator;

  $: videoTooltip = videoOff ? 'Unmute Video' : 'Mute Video';
  $: audioTooltip = audioOff ? 'Unmute Audio' : 'Mute Audio';
  $: shareTooltip = screenSharing ? 'Stop Sharing Screen' : 'Share Screen';

  let devices, // {selectedCamera, selectedMicrophone, selectedSpeaker}
    yourVideoStream,
    yourDisplayStream,
    peer,
    offerInterval,
    screenSharing = false,
    audioOff = false,
    videoOff = false;

  const _generateConstraints = () => {
    return generateConstraintsObject(devices?.selectedCamera, devices?.selectedMicrophone);
  };

  const _stopTracks = (stream) => {
    if (!stream) return;

    stream.getTracks().map((track) => track.stop());
  };

  const _attachStreamToVideoElement = (id, stream) => {
    const video = document.getElementById(id);

    if (video && stream) {
      video.srcObject = stream;
      return;
    }

    console.warn('html id or stream are undefined');
  };

  const _createPeer = () => new RTCPeerConnection({ iceServers: iceServers });

  const _addTracksToPeer = (peer) => {
    yourVideoStream.getTracks().map((track) => {
      peer.addTrack(track, yourVideoStream);
    });
  };

  const _asOfferer = async (peer) => {
    _addTracksToPeer(peer);

    peer.onnegotiationneeded = async () => {
      peer
        .createOffer()
        .then((offer) => {
          return peer.setLocalDescription(offer);
        })
        .then(() => {
          // sending offer until another peer answers
          offerInterval = setInterval(() => {
            emit('video-offer', { initiatorUid: uid, targetUid: participantUid, sdp: peer.localDescription });
            rtcLog('offer sent to another peer');
          }, 1000);
        })
        .catch(_onHandshakeError);
    };

    _bindCommonEventListeners(peer);

    on('video-answer', (data) => {
      rtcLog('got answer from another peer');
      clearInterval(offerInterval);

      peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    // code that dynamically changes stream source
    // setTimeout(async () => {
    //   const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //   _attachStreamToVideoElement('yourVideo', stream);

    //   peer.getSenders().map((sender) => {
    //     console.log(sender);

    //     stream.getVideoTracks().forEach(function (track) {
    //       const sender = peer.getSenders().find(function (s) {
    //         return s.track.kind == track.kind;
    //       });
    //       sender.replaceTrack(track);
    //     });
    //   });
    // }, 10000);
  };

  const _asAnswerer = (peer) => {
    _addTracksToPeer(peer);

    on('video-offer', async (data) => {
      rtcLog('received offer from another peer');

      peer
        .setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => {
          return peer.createAnswer();
        })
        .then((answer) => {
          return peer.setLocalDescription(answer);
        })
        .then(() => {
          emit('video-answer', { initiatorUid: uid, targetUid: participantUid, sdp: peer.localDescription });
        })
        .catch(_onHandshakeError);

      _bindCommonEventListeners(peer);
    });
  };

  const _onHandshakeError = (er) => {
    rtcError('Something went wrong during webrtc handshaking.');
    criticalErrorSubject.update((_) => 'Something went wrong during the handshaking.');
    criticalErrorSubject.update((_) => 'Reload the page and try again.');

    clearInterval(offerInterval);

    console.error(er);
  };

  const _bindCommonEventListeners = (peer) => {
    peer.ontrack = (event) => {
      rtcLog('tracks came from another peer');

      document.getElementById('participantVideo').srcObject = event.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        emit('ice-candidate', { initiatorUid: uid, targetUid: participantUid, candidate: e.candidate });
      }
    };

    on('ice-candidate', (data) => {
      if (data.candidate) {
        rtcLog('ice-candidate - received');

        peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  };

  const _replaceTrackForPeer = (peer, stream, kind) => {
    const track = stream.getTracks().find((t) => t.kind === kind);
    const sender = peer.getSenders().find((s) => s.track.kind === kind);

    sender.replaceTrack(track);

    return track;
  };

  const _fetchStream = async () => {
    return getUserMedia(_generateConstraints());
  };

  const _setSinkId = (htmlElementId, speaker) => {
    try {
      if (!htmlElementId && !speaker) {
        return;
      }

      const participantVideo = document.getElementById(htmlElementId);
      
      // setSinkId is not supported on mobile (see docs)
      if (participantVideo && !isMobile()) {
        participantVideo.setSinkId(speaker.deviceId);
      }
    } catch (er) {
      throw er;
    }
  }

  onMount(async () => {
    try {
      devices = fetchDevices();
      yourVideoStream = await _fetchStream();

      _attachStreamToVideoElement('yourVideo', yourVideoStream);
      _setSinkId('participantVideo', devices?.selectedSpeaker);

      peer = _createPeer();

      if (initiator) {
        _asOfferer(peer);
      } else {
        _asAnswerer(peer);
      }
    } catch (er) {
      const msg = mediaStreamErrorMsg(er.name);
      criticalErrorSubject.update((_) => msg);
    }
  });

  async function toggleMyVideo() {
    videoOff = !videoOff;

    if (!videoOff) {
      const newStream = await _fetchStream();
      const track = _replaceTrackForPeer(peer, newStream, 'video');

      yourVideoStream.addTrack(track);

      _attachStreamToVideoElement('yourVideo', yourVideoStream);
    } else {
      yourVideoStream.getVideoTracks()[0].enabled = false;

      setTimeout(() => {
        yourVideoStream.getVideoTracks()[0].stop();
        yourVideoStream.removeTrack(yourVideoStream.getVideoTracks()[0]);
      }, 150);

      // if you remove tracks immediately after disabling (enabled = false)
      // your video will be freezed for another participant
    }
  }

  async function shareScreen() {
    try {
      if (!screenSharing) {
        yourDisplayStream = await getDisplayMedia();

        _replaceTrackForPeer(peer, yourDisplayStream, 'video');

        // onended fires when user stops screen sharing from browser toast
        yourDisplayStream.getVideoTracks()[0].onended = () => {
          _stopTracks(yourDisplayStream);
          _replaceTrackForPeer(peer, yourVideoStream, 'video');

          screenSharing = false;
        };
      } else {
        _stopTracks(yourDisplayStream);
        _replaceTrackForPeer(peer, yourVideoStream, 'video');
      }

      screenSharing = !screenSharing;
    } catch (er) {
      if (er.name === 'NotAllowedError') {
        return criticalErrorSubject.update((_) => "You've canceled sharing screen");
      }

      criticalErrorSubject.update(
        (_) => 'Something went wrong during a screen sharing. Your browser may not support this feature ;('
      );
    }
  }

  function toggleMyMicrophone() {
    audioOff = !audioOff;
    yourVideoStream.getAudioTracks()[0].enabled = !yourVideoStream.getAudioTracks()[0].enabled;
  }

  function endCall() {}

  onDestroy(() => {
    _stopTracks(yourVideoStream);
    _stopTracks(yourDisplayStream);
  });
</script>

<div class="incoming-wrap">
  <!-- {participantUid} {username} {uid} -->
  <div class="incoming">
    <div class:hidden={videoOff} class="yourVideo-container">
      <video class:shadow={yourVideoStream} id="yourVideo" autoplay muted />
      {#if !yourVideoStream}
        <Spinner style="position: absolute" />
      {/if}
    </div>

    <div class="participant-video-container"><video id="participantVideo" autoplay muted={false} /></div>

    <div class="call-menu">
      <div class="call-menu-actions">
        {#if !screenSharing}
          <button class="action-button action-button__video" class:mute={videoOff} on:click={toggleMyVideo}>
            <span class="tooltip">{videoTooltip}</span>
            <i class="fas fa-video" />
          </button>
        {/if}
        <button class="action-button action-button__end-call" on:click={endCall}> 
          <span class="tooltip">End Call</span>
          <i class="fas fa-phone" />
        </button>
        <button class="action-button action-button__audio" class:mute={audioOff} on:click={toggleMyMicrophone}>
          <span class="tooltip">{audioTooltip}</span>
          <i class="fas fa-microphone-alt" />
        </button>
        <button class="action-button action-button__sharing" class:sharing={screenSharing} on:click={shareScreen}>
          <span class="tooltip">{shareTooltip}</span>
          <i class="fas fa-desktop" />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .incoming-wrap {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    backdrop-filter: blur(10px);

    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .incoming {
    border-radius: 30px;
    background-color: #202020;
    color: #eee;

    box-shadow: 0 0 44px -11px #131313;

    display: flex;
    flex-direction: column;
    animation: blinking 2s ease-in-out infinite;
    border: 3px solid rgb(22, 22, 22);

    width: 90%;
    max-width: 1400px;

    height: 100vh;
    max-height: 1000px;

    position: relative;
    overflow: hidden;
  }

  .yourVideo-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 260px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  #yourVideo {
    max-width: 100%;
    border-radius: 20px;
    z-index: 2;
  }

  .shadow {
    box-shadow: 0 0 15px #131313;
  }

  .participant-video-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  #participantVideo {
    height: 100%;
    z-index: 1;
  }

  .call-menu {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: -10px;
    right: -10px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: rgba(49, 49, 49, 0);
    padding: 20px;

    display: flex;
    justify-content: center;
  }

  .action-button {
    color: #ffffff;
    border: none;
    outline: none;
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 50%;
    background: rgb(77, 77, 77);
    width: 40px;
    height: 40px;
    box-shadow: 0 0 3px rgb(29, 29, 29);
    transition: 0.1s ease;
    position: relative;
    margin: 0 10px;
  }

  .action-button .tooltip {
    position: absolute;
    top: -10px;
    left: 50%;
    color: #000;
    text-align: center;
    transform: translateX(-50%);
    font-size: 0.8rem;
    background: rgb(247, 250, 52);
    padding: 3px 7px;
    border-radius: 5px;
    top: -30px;
    visibility: hidden;
    opacity: 0;
    transition:  0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transition-property: top opacity;
    z-index: 1;
    white-space: nowrap;
  }

  .action-button .tooltip::before {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -6px;

    width: 0;
    height: 0;
    border-style: solid;
    border-width: 7px 7.5px 0 7.5px;
    border-color: rgb(247, 250, 52) transparent transparent transparent;
  }

  .action-button__sharing.sharing {
    background: #ef5350;
  }

  .action-button__end-call .tooltip {
    background: #ef5350;
  }

  .action-button__end-call .tooltip::before {
    border-color: #ef5350 transparent transparent transparent;
  }

  .action-button:hover .tooltip {
    top: -35px;
    visibility: visible;
    opacity: 1;
  }

  .action-button::after {
    position: absolute;
    content: '';
    width: 0;
    height: 2px;
    background: #fff;
    transform: rotate(35deg);
    left: 12px;
    top: 12px;
    transition: 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.2s;
    transform-origin: 0 0;
    transition-property: width;
    border-radius: 1px;
  }

  .action-button::before {
    position: absolute;
    content: '';
    width: 0;
    border-radius: 1px;

    height: 2px;
    background: rgb(77, 77, 77);

    transform: rotate(35deg);
    transform-origin: 0 0;

    left: 10px;
    top: 13px;
    transition: width 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.2s;
  }

  .action-button:hover {
    box-shadow: 0 0 4px rgb(0, 0, 0);
  }

  .action-button:active {
    background: #ef5350;
  }

  .mute {
    background: #ef5350;
  }

  .mute::after,
  .mute::before {
    width: 23px;
  }

  .mute::before {
    background: #ef5350;
  }

  .action-button__end-call {
    /* background: #ef5350; */
  }

  .action-button__end-call {
    box-shadow: 0 0 5px #ef5350;
    color: #ef5350;
  }

  .action-button__end-call:hover {
    box-shadow: 0 0 8px #ef5350;
  }

  .action-button__end-call:active {
    color: #fff;
  }

  .action-button__end-call i {
    transform: rotate(225deg);
  }

  .call-menu-actions {
    background: rgba(0, 0, 0, 0.623);
    border-radius: 30px;
    padding: 10px;
  }

  .hidden {
    visibility: hidden;
  }
</style>
