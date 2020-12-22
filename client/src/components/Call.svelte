<script>
  import { mediaStreamErrorMsg } from './../services/media-stream-error-message.js';
  import Spinner from './Spinner.svelte';
  import { generateConstraintsObject, getUserMedia } from './../services/media-devices.js';
  import { criticalErrorSubject, deviceSelectorPopupSubject } from './../stores.js';
  import { onDestroy, onMount } from 'svelte';
  import { fetchDevices } from '../services/local-storage.js';
  import { iceServers } from '../ice-servers';
  import { emit, on } from '../services/socket.service.js';
  import { rtcLog } from '../services/logger.js';

  export let uid;
  export let participantUid;
  export let username;
  export let initiator;

  let yourVideoStream;
  let peer;

  const _generateContraints = () => {
    const devices = fetchDevices();

    return generateConstraintsObject(devices?.selectedCamera, devices?.selectedMicrophone);
  };

  const _stopLocalStream = () => {
    if (!yourVideoStream) return;

    yourVideoStream.getTracks().map((track) => track.stop());
  };

  const _attachStreamToVideoElement = (id, stream) => {
    const video = document.getElementById(id);

    if (video && stream) {
      video.srcObject = stream;
      return;
    }

    console.warn('html id or stream is undefined');
    return;
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
          emit('video-offer', { initiatorUid: uid, targetUid: participantUid, sdp: peer.localDescription });
          rtcLog('offer sent to another peer');
        });
    };

    _bindCommonEventListeners(peer);

    on('video-answer', (data) => {
      rtcLog('got answer from another peer');

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

  const _asWaiter = (peer) => {
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
        });
    });

    _bindCommonEventListeners(peer);
  };

  const _bindCommonEventListeners = (peer) => {
    peer.ontrack = (event) => {
      rtcLog('tracks came from another peer');

      document.getElementById('participantVideo').srcObject = event.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        rtcLog('ice-candidate - emitted');
        console.log(e.candidate);

        emit('ice-candidate', { initiatorUid: uid, targetUid: participantUid, candidate: e.candidate });
      }
    };

    on('ice-candidate', (data) => {
      if (data.candidate) {
        rtcLog('ice-candidate - received');
        console.log(data.candidate);

        peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  };

  onMount(async () => {
    try {
      const constraints = _generateContraints();
      yourVideoStream = await getUserMedia(constraints);

      _attachStreamToVideoElement('yourVideo', yourVideoStream);

      peer = _createPeer();

      if (initiator) {
        _asOfferer(peer);
      } else {
        _asWaiter(peer);
      }

      // await _attachCommonEventListenersToPeer();
    } catch (er) {
      const msg = mediaStreamErrorMsg(er.name);
      criticalErrorSubject.update((_) => msg);

      deviceSelectorPopupSubject.update((_) => false);
    }
  });

  onDestroy(() => {
    _stopLocalStream();
  });
</script>

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
    align-items: center;
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

    height: 90%;

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
    background: #000;
    padding: 40px;
  }
</style>

<div class="incoming-wrap">
  <!-- {participantUid} {username} {uid} -->
  <div class="incoming">
    <div class="yourVideo-container">
      <video class:shadow={yourVideoStream} id="yourVideo" autoplay muted />
      {#if !yourVideoStream}
        <Spinner style="position: absolute" />
      {/if}
    </div>

    <div class="participant-video-container"><video id="participantVideo" autoplay /></div>

    <div class="call-menu" />
  </div>
</div>
