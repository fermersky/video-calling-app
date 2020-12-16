<script>
	import { deviceSelectorPopup } from "./stores.js";
	import DeviceSettingsModal from "./components/DeviceSettingsModal.svelte";
	import { on, emit } from "./services/socket.service";

	let showDeviceSettingsPopup;

	deviceSelectorPopup.subscribe((val) => {
		showDeviceSettingsPopup = val;
	});

	on("join", (d) => {
		console.log(d);
	});

	function toggleDevicesSettingsPopup() {
		deviceSelectorPopup.update((value) => !value);
	}
</script>

<style>
	main {
		margin: 0 auto;
		position: relative;
		height: 100vh;
		text-align: center;
		padding: 40px;
	}

	.open-settings-btn {
		position: absolute;
		top: 34px;
		right: 180px;
		color: #fff;
		width: 30px;
		height: 30px;
		color: #b3ff00;
		cursor: pointer;
		z-index: 2;
		padding: 20px;
		font-size: 20px;
	}
</style>

<main>
	<h1>So call me maybe!</h1>
	<h2>Available users to call:</h2>

	<span on:click={toggleDevicesSettingsPopup} class="open-settings-btn">
		{#if showDeviceSettingsPopup}
			<i class="fas fa-times" />
		{:else}<i class="fas fa-cog" />{/if}
	</span>
</main>

{#if showDeviceSettingsPopup}
	<DeviceSettingsModal />
{/if}
