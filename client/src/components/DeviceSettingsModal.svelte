<script>
	import Select from './Select.svelte';
    import { onDestroy, onMount } from "svelte";

    let stream;

    onMount(async () => {
        const videoEl = document.getElementById("video");

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        videoEl.srcObject = stream;
    });

    onDestroy(() => {
        stream && stream.getTracks().map((track) => track.stop());
        stream = null;
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

        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .main-modal {
        padding: 40px;
        background: rgb(0, 0, 0);
        border-radius: 10px;
    }

    #video {
        max-width: 300px;
    }
</style>

<div class="main-modal-wrap">
    <div class="main-modal">
        <video autoplay muted id="video" />
        
        <Select />
    </div>
</div>
