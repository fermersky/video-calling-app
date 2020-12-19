<script>
  import Button from './components/Button.svelte';
  import { deviceSelectorPopupSubject, userInfoSubject } from './stores.js';
  import DeviceSettingsModal from './components/DeviceSettingsModal.svelte';
  import { on, emit } from './services/socket.service';
  import { fetchUserDetails, saveUserDetails } from './services/local-storage';
  import { onMount } from 'svelte';
  import Emoji from './components/Emoji.svelte';
  import Splitter from './components/Splitter.svelte';

  let showDeviceSettingsPopup;
  let username;
  let joined = false;
  let uid;
  let participantUid;

  $: callButtonDisabled = !(participantUid && participantUid.length === 4);

  onMount(() => {
    const user = fetchUserDetails();
    userInfoSubject.update(() => user);
  });

  const handleWelcome = (data) => {
    joined = true;
    userInfoSubject.update((_) => data);
    uid = data.uid;
    saveUserDetails(data);
  };

  on('welcome', handleWelcome);

  userInfoSubject.subscribe((val) => (username = val?.name));

  deviceSelectorPopupSubject.subscribe((val) => {
    showDeviceSettingsPopup = val;
  });

  function toggleDevicesSettingsPopup() {
    deviceSelectorPopupSubject.update((value) => !value);
  }

  function handleJoin(e) {
    emit('join', username);
  }

  function handleStartCall() {
    emit('try-call', { username, participantUid });
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
    margin: 20px 0;
    font-size: 1.4rem;
    width: 300px;
  }

  .join-form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  @media only screen and (max-width: 600px) {
    .join-form {
      flex-direction: column;
    }

    .open-settings-btn {
      left: 50%;
      transform: translateX(-50%);
    }

    h1 {
      margin-top: 100px;
    }
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
    <Emoji>🤙</Emoji>
    me maybe!
  </h1>

  <Splitter />

  {#if !joined}
    <div class="join-form">
      <h2 style="margin-right: 20px;">Who are you?</h2>
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

      <h3>or enter number shared with you below</h3>

      <form on:submit|preventDefault={handleStartCall}>
        <input bind:value={participantUid} type="text" id="name-input" placeholder="XYZZ" />
        <Button type="submit" disabled={callButtonDisabled}>Call</Button>
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
