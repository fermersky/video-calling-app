<script>
  import Button from './components/Button.svelte';
  import { deviceSelectorPopupSubject, userInfoSubject } from './stores.js';
  import DeviceSettingsModal from './components/DeviceSettingsModal.svelte';
  import { on, emit } from './services/socket.service';
  import { fetchName, saveName } from './services/local-storage';
  import { onMount } from 'svelte';
  import Emoji from './components/Emoji.svelte';
  import Splitter from './components/Splitter.svelte';

  let showDeviceSettingsPopup;
  let username;
  let joined = false;
  let uid;

  onMount(() => {
    const name = fetchName();
    userInfoSubject.update(() => name);
  });

  const handleWelcome = (data) => {
    joined = true;
    userInfoSubject.update((_) => data);
    uid = data.uid;
  };

  on('welcome', handleWelcome);

  userInfoSubject.subscribe((val) => (username = val));

  deviceSelectorPopupSubject.subscribe((val) => {
    showDeviceSettingsPopup = val;
  });

  function toggleDevicesSettingsPopup() {
    deviceSelectorPopupSubject.update((value) => !value);
  }

  function handleJoin(e) {
    emit('join', username);
    saveName(username);
  }

  function handleStartCall() {}
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

  #name-input {
    background-color: #555;
    border: none;
    outline: none;
    box-shadow: 5px 5px 10px #000;
    padding: 10px 20px;
    border-radius: 10px;
    color: #eee;
    margin: 20px;
    font-size: 1.4rem;
    width: 300px;
  }

  .flex-row {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .uid-label {
    background: rgb(27, 27, 27);
    display: inline-block;
    padding: 20px;
    border-radius: 10px;
    font-size: 3rem;
    margin: 40px;
    box-shadow: 0 0 10px #000;
  }
</style>

<main>
  <h1>
    So
    <Emoji label="phone">🤙</Emoji>
    me maybe!
  </h1>

  <Splitter />

  {#if !joined}
    <div class="flex-row">
      <h2>Who are you?</h2>

      <form on:submit|preventDefault={handleJoin}>
        <input bind:value={username} type="text" id="name-input" placeholder="What is your name, hero?" />
        <Button type="submit" disabled={!username}>Join</Button>
      </form>
    </div>
  {:else}
    <div style="margin: 20px;">
      <h2>Your unique number is</h2>
      <h3 class="uid-label">{uid}</h3>
      <h3>Share this number to the one who wanna call you</h3>
      <Splitter />

      <h3>or input shared with you number below</h3>

      <form on:submit|preventDefault={handleStartCall}>
        <input type="text" id="name-input" placeholder="XYZZ" />
        <Button type="submit" disabled={!username}>Call</Button>
      </form>
    </div>
  {/if}

  <span on:click={toggleDevicesSettingsPopup} class="open-settings-btn">
    {#if showDeviceSettingsPopup}<i class="fas fa-times" />{:else}<i class="fas fa-cog" />{/if}
  </span>
</main>

{#if showDeviceSettingsPopup}
  <DeviceSettingsModal />
{/if}
