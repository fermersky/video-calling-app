<script>
  import Spinner from './Spinner.svelte';
  import { generateConstraintsObject, getUserMedia } from './../services/media-devices.js';
  import { criticalErrorSubject, deviceSelectorPopupSubject } from './../stores.js';
  import { onDestroy, onMount } from 'svelte';
  import { fetchDevices } from '../services/local-storage.js';

  export let uid;
  export let participantUid;
  export let username;

  export let yourVideoStream;

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

  onMount(async () => {
    try {
      const constraints = _generateContraints();
      yourVideoStream = await getUserMedia(constraints);

      _attachStreamToVideoElement('yourVideo', yourVideoStream);
      _attachStreamToVideoElement('participantVideo', yourVideoStream);
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
    padding: 40px;
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

  #participantVideo {
    position: absolute;
    transform: translateY(-15%);
    top: -5px;
    left: -5px;
    right: -5px;
    width: 100%;
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
