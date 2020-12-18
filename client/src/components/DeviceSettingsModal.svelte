<script>
	import { deviceSelectorPopup } from './../stores.js';
    import { fetchDevices, saveDevices } from './../services/local-storage.js';
    import Button from "./Button.svelte";
    import {
        getUserMedia,
        getMediaDevices,
    } from "../services/media-devices.js";
    import Select from "./Select.svelte";
    import { onDestroy, onMount } from "svelte";

    let stream;
    let cameras = [],
        microphones = [],
        speakers = [];

    $: allDevices = [...cameras, ...microphones, ...speakers];

    let selectedCamera, selectedMicrophone, selectedSpeaker;

    onMount(async () => {
        await _displayUserVideo();
        await _initializeDeviceLists();
        _initializeSelectedDevices();
    });

    const _displayUserVideo = async () => {
        const videoEl = document.getElementById("video");
        stream = await getUserMedia();
        videoEl.srcObject = stream;
    };


    const _initializeDeviceLists = async () => {
        const [_cameras, _microphones, _speakers] = await getMediaDevices();

        cameras = _cameras;
        microphones = _microphones;
        speakers = _speakers;
    };

    const _initializeSelectedDevices = () => {
        selectedCamera = _getDefaultDevice("videoinput");
        selectedMicrophone = _getDefaultDevice("audioinput");
        selectedSpeaker = speakers[0];
    };

    const _getDefaultDevice = (kind) => {
        const alreadySelectedDevices = fetchDevices();

        // if (alreadySelectedDevices) {
        //     const device = _filterDevicesBy('kind', kind)
        // }

        const defaultSystemLabels = _getDefaultDevicesLabels();

        const specificKindDevices = _filterDevicesBy("kind", kind);

        const groupId = specificKindDevices.find((device) =>
            defaultSystemLabels.includes(device.label)
        )?.groupId;

        const selectedDevice = distinct(specificKindDevices).find((d) => d.groupId === groupId);
        return selectedDevice;
    };

    const _getDefaultDevicesLabels = () => {
        return stream.getTracks().map((track) => track.label);
    };

    const _findDeviceById = (id) => {
        const [device] = _filterDevicesBy("deviceId", id);
        return device;
    };

    const _filterDevicesBy = (prop, value) => {
        return allDevices.filter((device) => device[prop] === value);
    };

    const _generateConstraintObject = () => {
        let constraints = {video: true, audio: true};

        if (selectedCamera?.deviceId) {
            constraints = {...constraints, video: {deviceId: {exact: selectedCamera.deviceId}}}
        }

        if (selectedMicrophone?.deviceId) {
            constraints = {...constraints, audio: {deviceId: {exact: selectedMicrophone.deviceId}}}
        }

        return constraints;
    }

    const _stopStreamTracks = () => {
        if (stream) {
            stream.getTracks().map(track => track.stop());
        }

        stream = null;
        video.srcObject = null;
    }

    function distinct(devices) {
        return devices.filter(
            (device) => !["default", "communications"].includes(device.deviceId)
        );
    }

    async function onCameraSelect({ detail }) {
        const cameraId = detail;
        selectedCamera = _findDeviceById(cameraId);

        _stopStreamTracks();

        stream = await getUserMedia(_generateConstraintObject());
        video.srcObject = stream;
    }

    function onMicrophoneSelect({ detail }) {
        const microphoneId = detail;
        selectedMicrophone = _findDeviceById(microphoneId);
    }

    function onSpeakerSelect({ detail }) {
        const speakerId = detail;
        selectedSpeaker = _findDeviceById(speakerId);
    }

    function onSaveButtonClick() {
        saveDevices({selectedCamera, selectedMicrophone, selectedSpeaker});
        deviceSelectorPopup.update(_ => false)
    }

    onDestroy(() => {
        _stopStreamTracks();
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
    }

    .video-container {
        max-width: 100%;
        height: 200px;
        overflow: hidden;
    }

    #video {
        max-width: 300px;
    }
</style>

<div class="main-modal-wrap">
    <div class="main-modal">
        <div class="video-container">
            <video autoplay muted id="video" />
        </div>

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

        <Select
            on:onSelect={onSpeakerSelect}
            defaultValue={selectedSpeaker?.deviceId}
            key="deviceId"
            value="label"
            title="Default speaker"
            items={distinct(speakers)} />

        <Button on:onClick={onSaveButtonClick}>Save</Button>
    </div>
</div>