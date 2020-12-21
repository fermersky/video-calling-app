<script>
  import { mediaStreamErrorMsg } from './../services/media-stream-error-message.js';
  import Spinner from './Spinner.svelte';
  import { generateConstraintsObject, getUserMedia } from './../services/media-devices.js';
  import { criticalErrorSubject, deviceSelectorPopupSubject } from './../stores.js';
  import { onDestroy, onMount } from 'svelte';
  import { fetchDevices } from '../services/local-storage.js';
  import { iceServers } from '../ice-servers';
  import { emit, on } from '../services/socket.service.js';

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

  const _createPeerAndSendOffer = async () => {
    peer = _createPeer();

    yourVideoStream.getTracks().map((track) => {
      peer.addTrack(track, yourVideoStream);
    });

    // peer.onnegotiationneeded = async () => {
    peer
      .createOffer()
      .then((offer) => {
        return peer.setLocalDescription(offer);
      })
      .then(() => {
        console.warn('offer has been sended');
        emit('video-offer', { initiatorUid: uid, targetUid: participantUid, sdp: peer.localDescription });
      });
    // };

    peer.ontrack = (event) => {
      console.warn('I received a new track');

      document.getElementById('participantVideo').srcObject = event.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        emit('ice-candidate', { initiatorUid: uid, targetUid: participantUid, candidate: e.candidate });
      }
    };

    on('ice-candidate', (data) => {
      if (data.candidate) {
        console.warn(data.candidate);
        peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    on('video-answer', (data) => {
      peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.warn('caller handled video-answer');
    });
  };

  const _createPeerAndWaitOffer = () => {
    peer = _createPeer();

    yourVideoStream.getTracks().map((track) => {
      peer.addTrack(track, yourVideoStream);
    });

    on('video-offer', async (data) => {
      console.warn('I have an offer');
      peer
        .setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => {
          console.warn('I have an offer, ', data);

          return peer.createAnswer();
        })
        .then((answer) => {
          return peer.setLocalDescription(answer);
        })
        .then(() => {
          emit('video-answer', { initiatorUid: uid, targetUid: participantUid, sdp: peer.localDescription });
        });

      peer.ontrack = (event) => {
        console.warn('I received a new track');
        document.getElementById('participantVideo').srcObject = event.streams[0];
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          emit('ice-candidate', { initiatorUid: uid, targetUid: participantUid, candidate: e.candidate });
        }
      };

      on('ice-candidate', (data) => {
        if (data.candidate) {
          console.warn(data.candidate);
          peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });
    });
  };

  const _attachCommonEventListenersToPeer = () => {};

  onMount(async () => {
    try {
      const constraints = _generateContraints();
      yourVideoStream = await getUserMedia(constraints);

      _attachStreamToVideoElement('yourVideo', yourVideoStream);

      if (initiator) {
        await _createPeerAndSendOffer();
      } else {
        await _createPeerAndWaitOffer();
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
    border-radius: 20px;
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

    <div class="participant-video-container"><video muted id="participantVideo" autoplay /></div>

    <div class="call-menu" />
  </div>
</div>
