<script>
  import { mediaStreamErrorMsg } from './../services/media-stream-error-message.js';
  import Spinner from './Spinner.svelte';
  import { isMobile } from './../services/is-mobile.js';
  import { generateConstraintsObject } from './../services/media-devices.js';
  import { deviceSelectorPopupSubject, criticalErrorSubject } from './../stores.js';
  import { fetchDevices, saveDevices } from './../services/local-storage.js';
  import Button from './Button.svelte';
  import { getUserMedia, getMediaDevices } from '../services/media-devices.js';
  import Select from './Select.svelte';
  import { onDestroy, onMount } from 'svelte';

  let stream;
  let cameras = [],
    microphones = [],
    speakers = [];

  let selectedCamera, selectedMicrophone, selectedSpeaker;

  onMount(async () => {
    try {
      const alreadySelectedDevices = fetchDevices();

      if (alreadySelectedDevices) {
        selectedCamera = alreadySelectedDevices.selectedCamera;
        selectedMicrophone = alreadySelectedDevices.selectedMicrophone;
      }

      _subscribeOnEscapeClick();
      _subscribeOnOutsideClick();

      await _displayUserVideo();
      await _initializeDeviceLists();
      _initializeSelectedDevices();
    } catch (er) {
      const msg = mediaStreamErrorMsg(er.name);
      criticalErrorSubject.update((_) => msg);

      deviceSelectorPopupSubject.update((_) => false);
    }
  });

  const _escapeButtonListener = (e) => {
    if (e.key === 'Escape') {
      deviceSelectorPopupSubject.update((_) => false);
    }
  };

  const _outsideClickListener = (e) => {
    const modal = document.querySelector('.main-modal-wrap');

    if (e.target.contains(modal)) {
      deviceSelectorPopupSubject.update((_) => false);
    }
  };

  const _subscribeOnEscapeClick = () => {
    window.addEventListener('keydown', _escapeButtonListener);
  };

  const _unsubscribeOnEscapeClick = () => {
    window.removeEventListener('keydown', _escapeButtonListener);
  };

  const _subscribeOnOutsideClick = () => {
    window.addEventListener('click', _outsideClickListener);
  };

  const _unsubscribeOnOutsideClick = () => {
    window.removeEventListener('click', _outsideClickListener);
  };

  const _displayUserVideo = async () => {
    const videoEl = document.getElementById('video');
    const constraints = generateConstraintsObject(selectedCamera, selectedMicrophone);

    stream = await getUserMedia(constraints);
    videoEl.srcObject = stream;
  };

  const _initializeDeviceLists = async () => {
    const [_cameras, _microphones, _speakers] = await getMediaDevices();

    cameras = _cameras;
    microphones = _microphones;
    speakers = _speakers;
  };

  const _initializeSelectedDevices = () => {
    selectedCamera = _getDefaultCamera(cameras);
    selectedMicrophone = _getDefaultMicrophone(microphones);
    selectedSpeaker = _getDefaultSpeaker(speakers);
  };

  const _getDefaultCamera = (devices) => {
    return _getDefaultDevice('videoinput', devices);
  };

  const _getDefaultMicrophone = (devices) => {
    return _getDefaultDevice('audioinput', devices);
  };

  const _getDefaultSpeaker = (devices) => {
    const alreadySelectedDevices = fetchDevices();

    if (!alreadySelectedDevices) {
      return;
    }

    const [speaker] = _filterDevicesBy(devices, 'kind', 'audiooutput');

    return speaker || devices[0];
  };

  const _getDefaultDevice = (kind, devices) => {
    const defaultSystemLabels = _getDefaultDevicesLabels();

    const groupId = devices.find((device) => defaultSystemLabels.includes(device.label))?.groupId;

    const selectedDevice = distinct(devices).find((d) => d.groupId === groupId);
    return selectedDevice;
  };

  const _getDefaultDevicesLabels = () => {
    return stream.getTracks().map((track) => track.label);
  };

  const _findDeviceById = (devices, id) => {
    const [device] = _filterDevicesBy(devices, 'deviceId', id);
    return device;
  };

  const _filterDevicesBy = (devices, prop, value) => {
    return devices.filter((device) => device[prop] === value);
  };

  const _stopStreamTracks = () => {
    if (stream) {
      stream.getTracks().map((track) => track.stop());
    }

    stream = null;
    video.srcObject = null;
  };

  function distinct(devices) {
    return devices.filter((device) => !['default', 'communications'].includes(device.deviceId));
  }

  async function onCameraSelect({ detail }) {
    try {
      const cameraId = detail;
      selectedCamera = _findDeviceById(distinct(cameras), cameraId);

      _stopStreamTracks();

      stream = await getUserMedia(generateConstraintsObject(selectedCamera, selectedMicrophone));
      video.srcObject = stream;
    } catch (er) {
      const msg = mediaStreamErrorMsg(er.name);
      criticalErrorSubject.update((_) => msg);

      deviceSelectorPopupSubject.update((_) => false);
    }
  }

  function onMicrophoneSelect({ detail }) {
    const microphoneId = detail;
    selectedMicrophone = _findDeviceById(distinct(microphones), microphoneId);
  }

  function onSpeakerSelect({ detail }) {
    const speakerId = detail;
    selectedSpeaker = _findDeviceById(distinct(speakers), speakerId);
  }

  function onSaveButtonClick() {
    saveDevices({ selectedCamera, selectedMicrophone, selectedSpeaker });
    deviceSelectorPopupSubject.update((_) => false);
  }

  onDestroy(() => {
    _stopStreamTracks();
    _unsubscribeOnEscapeClick();
    _unsubscribeOnOutsideClick();
  });
</script>

<style>
  .main-modal-wrap {
    top: 0;
    transition: 0.3s;
    right: 0;
    left: 0;
    bottom: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.329);
    backdrop-filter: blur(3px);

    color: #eee;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .main-modal {
    padding: 40px;
    background: rgb(0, 0, 0);
    border-radius: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    position: relative;
  }

  .video-container {
    max-width: 100%;
    height: 200px;
    overflow: hidden;
  }

  #video {
    max-width: 300px;
  }

  .spinner-wrap {
    position: absolute;
    top: 100px;
  }
</style>

<div class="main-modal-wrap">
  <div class="main-modal">
    {#if !stream}
      <div class="spinner-wrap">
        <Spinner />
      </div>
    {/if}

    <div class="video-container"><video autoplay muted id="video" /></div>

    <Select
      on:onSelect={onCameraSelect}
      defaultValue={selectedCamera?.deviceId}
      key="deviceId"
      value="label"
      title="Default camera"
      items={distinct(cameras)} />

    <Select
      on:onSelect={onMicrophoneSelect}
      defaultValue={selectedMicrophone?.deviceId}
      key="deviceId"
      value="label"
      title="Default microphone"
      items={distinct(microphones)} />

    {#if !isMobile()}
      <Select
        on:onSelect={onSpeakerSelect}
        defaultValue={selectedSpeaker?.deviceId}
        key="deviceId"
        value="label"
        title="Default speaker"
        items={distinct(speakers)} />
    {/if}

    <Button on:onClick={onSaveButtonClick}>Save</Button>
  </div>
</div>
